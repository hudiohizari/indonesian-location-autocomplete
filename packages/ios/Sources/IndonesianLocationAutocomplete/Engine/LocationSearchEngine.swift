/*
 * Created by Hudio Hizari
 * https://hizari.my.id/
 * https://github.com/hudiohizari/
 * hhizari@gmail.com
 */

import Foundation

/// Thread-safe cancellation flag to bridge Swift Task cancellation into GCD closures.
/// Task.isCancelled does NOT work inside DispatchQueue.async blocks (no Task context).
private final class CancellationFlag: @unchecked Sendable {
    private let lock = NSLock()
    private var _isCancelled = false

    var isCancelled: Bool {
        lock.withLock { _isCancelled }
    }

    func cancel() {
        lock.withLock { _isCancelled = true }
    }
}

public class LocationSearchEngine: ObservableObject {
    /// Whether the database has finished loading. Observe this to show loading states.
    @Published public private(set) var isLoaded = false

    /// Internal storage for parsed records. Not @Published to avoid triggering
    /// SwiftUI diffs on an 80k-element array that consumers never directly observe.
    private var cachedRecords: [LocationRecord] = []

    /// Pre-computed lowercased search strings, parallel to cachedRecords.
    /// Built once during init to avoid per-search allocation.
    /// Structs are value types , caching on the struct itself doesn't persist across copies.
    private var searchStrings: [String] = []

    /// Serializes concurrent init requests to prevent double-loading.
    private let initLock = NSLock()
    private var isInitializing = false

    /// Pre-compiled regex for punctuation normalization.
    private static let punctuationRegex = try! NSRegularExpression(pattern: "[,.\\-]", options: [])

    public init() {}

    /// Internal initializer for tests: injects pre-loaded mock data without going through `initEngine()`.
    internal init(records: [LocationRecord]) {
        self.cachedRecords = records
        self.searchStrings = records.map { record in
            "\(record.village)\n\(record.district)\n\(record.regency)\n\(record.province)\n\(record.code)".lowercased()
        }
        self.isLoaded = true
    }

    /**
     * Loads and parses the complete postcode database from SPM resources.
     * Thread-safe: uses a tri-state flag (idle/loading/loaded) to prevent
     * concurrent callers from double-loading the 15MB JSON.
     * Pre-computes lowercased search strings for O(1) access during search.
     */
    public func initEngine() async throws {
        // Fast path: already loaded
        guard !isLoaded else { return }

        // Tri-state check: idle → loading (we do it), loading → wait, loaded → return
        let iAmLoader: Bool = initLock.withLock {
            if isLoaded { return false }
            if isInitializing { return false }
            isInitializing = true
            return true
        }

        if !iAmLoader {
            // Another caller is loading , wait for it to finish
            while true {
                try? await Task.sleep(nanoseconds: 50_000_000) // 50ms
                if isLoaded { return }
                // If loader failed (isInitializing reset but isLoaded still false), retry
                let shouldRetry = initLock.withLock { !isInitializing && !isLoaded }
                if shouldRetry {
                    try await initEngine()
                    return
                }
            }
        }

        #if SWIFT_PACKAGE
        let bundle = Bundle.module
        #else
        let bundle = Bundle(for: type(of: self))
        #endif

        guard let url = bundle.url(forResource: "indonesia-postcodes", withExtension: "json") else {
            initLock.withLock { isInitializing = false }
            throw NSError(
                domain: "LocationSearchEngine",
                code: 404,
                userInfo: [NSLocalizedDescriptionKey: "indonesia-postcodes.json not found in resources"]
            )
        }

        do {
            let data = try Data(contentsOf: url, options: .mappedIfSafe)
            let decoder = JSONDecoder()
            let records = try decoder.decode([LocationRecord].self, from: data)

            // Pre-compute all search strings once during init , avoids per-search allocation.
            let strings = records.map { record in
                "\(record.village)\n\(record.district)\n\(record.regency)\n\(record.province)\n\(record.code)".lowercased()
            }

            await MainActor.run {
                self.cachedRecords = records
                self.searchStrings = strings
                self.isLoaded = true
            }
        } catch {
            initLock.withLock { isInitializing = false }
            throw error
        }
    }

    /**
     * Searches the local location database using multi-term search rules.
     * Runs on a background GCD queue for UI smoothness.
     * Uses CancellationFlag to bridge Task cancellation into the GCD block.
     */
    public func searchLocations(
        query: String,
        maxResults: Int = 10,
        minQueryLength: Int = 3,
        filter: ((LocationRecord) -> Bool)? = nil
    ) async -> [LocationRecord] {
        if query.trimmingCharacters(in: .whitespacesAndNewlines).count < minQueryLength {
            return []
        }

        if !isLoaded {
            do {
                try await initEngine()
            } catch {
                print("LocationSearchEngine error: failed to initialize database: \(error)")
                return []
            }
        }

        let normalized = query.lowercased()
        let range = NSRange(normalized.startIndex..., in: normalized)
        let cleaned = Self.punctuationRegex
            .stringByReplacingMatches(in: normalized, options: [], range: range, withTemplate: " ")
            .trimmingCharacters(in: .whitespacesAndNewlines)

        let searchTerms = cleaned.split(separator: " ")
            .map { String($0) }
            .filter { !$0.isEmpty }

        if searchTerms.isEmpty {
            return []
        }

        // Capture arrays locally to avoid referencing self inside the GCD closure
        let records = self.cachedRecords
        let strings = self.searchStrings

        let flag = CancellationFlag()

        return await withTaskCancellationHandler {
            await withCheckedContinuation { continuation in
                DispatchQueue.global(qos: .userInitiated).async {
                    var results: [LocationRecord] = []
                    for i in 0..<records.count {
                        // Check cancellation via flag (Task.isCancelled doesn't work in GCD)
                        if i % 2000 == 0 && i > 0 && flag.isCancelled {
                            continuation.resume(returning: [])
                            return
                        }

                        if results.count >= maxResults { break }

                        let searchStr = strings[i]
                        let matches = searchTerms.allSatisfy { term in
                            searchStr.contains(term)
                        }

                        if matches {
                            if let filter = filter {
                                if filter(records[i]) {
                                    results.append(records[i])
                                }
                            } else {
                                results.append(records[i])
                            }
                        }
                    }
                    continuation.resume(returning: results)
                }
            }
        } onCancel: {
            flag.cancel()
        }
    }
}
