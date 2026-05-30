/*
 * Created by Hudio Hizari
 * https://hizari.my.id/
 * https://github.com/hudiohizari/
 * hhizari@gmail.com
 */

import Foundation

public class LocationSearchEngine: ObservableObject {
    @Published public private(set) var cachedRecords: [LocationRecord] = []
    @Published public private(set) var isLoaded = false
    
    private let queue = DispatchQueue(label: "id.my.hizari.indonesianlocation.autocomplete.engine", qos: .userInitiated)

    public init() {}

    /// Internal initializer for tests: injects pre-loaded mock data without going through `initEngine()`.
    internal init(records: [LocationRecord]) {
        self.cachedRecords = records
        self.isLoaded = true
    }

    /**
     * Loads and parses the complete postcode database from SPM resources on a background thread.
     */
    public func initEngine() async throws {
        guard !isLoaded else { return }
        
        #if SWIFT_PACKAGE
        let bundle = Bundle.module
        #else
        let bundle = Bundle(for: type(of: self))
        #endif
        
        guard let url = bundle.url(forResource: "indonesia-postcodes", withExtension: "json") else {
            throw NSError(
                domain: "LocationSearchEngine",
                code: 404,
                userInfo: [NSLocalizedDescriptionKey: "indonesia-postcodes.json not found in resources"]
            )
        }

        let data = try Data(contentsOf: url, options: .mappedIfSafe)
        let decoder = JSONDecoder()
        let records = try decoder.decode([LocationRecord].self, from: data)

        await MainActor.run {
            self.cachedRecords = records
            self.isLoaded = true
        }
    }

    /**
     * Searches the local location database using debounced multi-term search rules.
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
            .replacingOccurrences(of: "[,.\\-]", with: " ", options: .regularExpression)
            .trimmingCharacters(in: .whitespacesAndNewlines)

        let searchTerms = normalized.split(separator: " ")
            .map { String($0) }
            .filter { !$0.isEmpty }

        if searchTerms.isEmpty {
            return []
        }

        // Run search rules on a background queue to ensure UI smoothness
        return await withCheckedContinuation { continuation in
            queue.async { [weak self] in
                guard let self = self else {
                    continuation.resume(returning: [])
                    return
                }

                var results: [LocationRecord] = []
                for item in self.cachedRecords {
                    if results.count >= maxResults {
                        break
                    }

                    let searchStr = item.searchStr
                    let matches = searchTerms.allSatisfy { term in
                        searchStr.contains(term)
                    }

                    if matches {
                        if let filter = filter {
                            if filter(item) {
                                results.append(item)
                            }
                        } else {
                            results.append(item)
                        }
                    }
                }
                continuation.resume(returning: results)
            }
        }
    }
}
