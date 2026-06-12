/*
 * Created by Hudio Hizari
 * https://hizari.my.id/
 * https://github.com/hudiohizari/
 * hhizari@gmail.com
 */

import SwiftUI

public struct AutocompleteTexts {
    public let placeholder: String
    public let noResults: String

    public init(placeholder: String = "Search location...", noResults: String = "No locations found") {
        self.placeholder = placeholder
        self.noResults = noResults
    }
}

public struct IndonesianLocationAutocomplete: View {
    @Binding public var value: String
    public var onQueryChange: (String) -> Void
    public var onLocationSelect: (LocationRecord) -> Void

    public var searchEngine: LocationSearchEngine?
    public var maxResults: Int = 10
    public var minQueryLength: Int = 3
    public var debounceMs: Int = 300
    public var texts: AutocompleteTexts = AutocompleteTexts()
    public var enabled: Bool = true

    public var filter: ((LocationRecord) -> Bool)? = nil
    public var searchProvider: ((String) async -> [LocationRecord])? = nil

    // UI Formatting customization
    public var formatSelectedLocation: (LocationRecord) -> String = { "\($0.village), \($0.district), \($0.regency), \($0.province) - \($0.code)" }
    public var renderEmptyState: ((String) -> AnyView)? = nil

    @State private var query: String = ""
    @State private var results: [LocationRecord] = []
    @State private var isSearching: Bool = false
    @State private var isOpen: Bool = false
    @State private var isSelecting: Bool = false
    @State private var searchTask: Task<Void, Never>? = nil

    public init(
        value: Binding<String>,
        onQueryChange: @escaping (String) -> Void,
        onLocationSelect: @escaping (LocationRecord) -> Void,
        searchEngine: LocationSearchEngine? = nil,
        maxResults: Int = 10,
        minQueryLength: Int = 3,
        debounceMs: Int = 300,
        texts: AutocompleteTexts = AutocompleteTexts(),
        enabled: Bool = true,
        filter: ((LocationRecord) -> Bool)? = nil,
        searchProvider: ((String) async -> [LocationRecord])? = nil,
        formatSelectedLocation: @escaping (LocationRecord) -> String = { "\($0.village), \($0.district), \($0.regency), \($0.province) - \($0.code)" },
        renderEmptyState: ((String) -> AnyView)? = nil
    ) {
        self._value = value
        self.onQueryChange = onQueryChange
        self.onLocationSelect = onLocationSelect
        self.searchEngine = searchEngine
        self.maxResults = maxResults
        self.minQueryLength = minQueryLength
        self.debounceMs = debounceMs
        self.texts = texts
        self.enabled = enabled
        self.filter = filter
        self.searchProvider = searchProvider
        self.formatSelectedLocation = formatSelectedLocation
        self.renderEmptyState = renderEmptyState
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Text Input Container
            HStack(spacing: 8) {
                Image(systemName: "mappin.circle.fill")
                    .foregroundColor(.secondary)
                    .font(.system(size: 18))
                
                TextField(texts.placeholder, text: $query)
                    .disabled(!enabled)
                    .font(.body)
                    .autocapitalization(.none)
                    .disableAutocorrection(true)
                    .onChange(of: query) { newValue in
                        if isSelecting {
                            isSelecting = false
                            return
                        }
                        onQueryChange(newValue)
                        triggerSearch(query: newValue)
                    }
                    .onAppear {
                        query = value
                    }
                    .onChange(of: value) { newValue in
                        if !isOpen {
                            query = newValue
                        }
                    }
                
                if isSearching {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle())
                        .scaleEffect(0.8)
                }
            }
            .padding(.vertical, 10)
            .padding(.horizontal, 12)
            .background(Color(uiColor: .systemBackground))
            .cornerRadius(8)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(Color(uiColor: .separator), lineWidth: 1)
            )
            
            // Dropdown Suggestion List Overlay popup
            if isOpen && (!results.isEmpty || (query.trimmingCharacters(in: .whitespacesAndNewlines).count >= minQueryLength && !isSearching)) {
                VStack(alignment: .leading, spacing: 0) {
                    if results.isEmpty {
                        if let renderEmptyState = renderEmptyState {
                            renderEmptyState(query)
                        } else {
                            Text(texts.noResults)
                                .foregroundColor(.secondary)
                                .font(.subheadline)
                                .padding()
                                .frame(maxWidth: .infinity, alignment: .leading)
                        }
                    } else {
                        ScrollView {
                            LazyVStack(alignment: .leading, spacing: 0) {
                                ForEach(results) { loc in
                                    Button(action: {
                                        searchTask?.cancel()
                                        isSelecting = true
                                        let formatted = formatSelectedLocation(loc)
                                        query = formatted
                                        value = formatted
                                        onQueryChange(formatted)
                                        isOpen = false
                                        isSearching = false
                                        results = []
                                        onLocationSelect(loc)
                                    }) {
                                        HStack(alignment: .top, spacing: 10) {
                                            Image(systemName: "mappin.and.ellipse")
                                                .foregroundColor(.red)
                                                .font(.system(size: 14))
                                                .padding(.top, 3)
                                            
                                            VStack(alignment: .leading, spacing: 2) {
                                                Text("\(loc.village), \(loc.district)")
                                                    .foregroundColor(.primary)
                                                    .font(.subheadline)
                                                    .fontWeight(.medium)
                                                    .multilineTextAlignment(.leading)
                                                
                                                Text("\(loc.regency), \(loc.province) - \(loc.code)")
                                                    .foregroundColor(.secondary)
                                                    .font(.caption)
                                                    .multilineTextAlignment(.leading)
                                            }
                                            Spacer()
                                        }
                                        .padding(.vertical, 10)
                                        .padding(.horizontal, 12)
                                        .contentShape(Rectangle())
                                    }
                                    
                                    Divider()
                                        .padding(.leading, 36)
                                }
                            }
                        }
                        .frame(maxHeight: 200)
                    }
                }
                .background(Color(uiColor: .secondarySystemBackground))
                .cornerRadius(8)
                .shadow(color: Color.black.opacity(0.1), radius: 6, x: 0, y: 4)
                .padding(.top, 4)
                .transition(.opacity.combined(with: .move(edge: .top)))
                .zIndex(100)
            }
        }
    }

    private func triggerSearch(query: String) {
        searchTask?.cancel()

        guard query.trimmingCharacters(in: .whitespacesAndNewlines).count >= minQueryLength else {
            results = []
            isOpen = false
            isSearching = false
            return
        }

        isSearching = true
        isOpen = true

        searchTask = Task {
            // Wait for debounce period (converted to nanoseconds)
            try? await Task.sleep(nanoseconds: UInt64(debounceMs) * 1_000_000)
            guard !Task.isCancelled else { return }

            let searchQuery = query
            let matchedResults: [LocationRecord]
            if let searchProvider = searchProvider {
                matchedResults = await searchProvider(searchQuery)
            } else if let searchEngine = searchEngine {
                matchedResults = await searchEngine.searchLocations(
                    query: searchQuery,
                    maxResults: maxResults,
                    minQueryLength: minQueryLength,
                    filter: filter
                )
            } else {
                matchedResults = []
            }

            guard !Task.isCancelled else { return }

            await MainActor.run {
                // Only apply results if the query hasn't changed and dropdown is still open
                if self.query == searchQuery && self.isOpen {
                    self.results = matchedResults
                }
                self.isSearching = false
            }
        }
    }
}
