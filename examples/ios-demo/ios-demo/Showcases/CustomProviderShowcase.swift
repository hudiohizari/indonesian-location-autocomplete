/*
 * Created by Hudio Hizari
 * https://hizari.my.id/
 * https://github.com/hudiohizari/
 * hhizari@gmail.com
 */

import SwiftUI
import IndonesianLocationAutocomplete

/// Showcase 6: Custom async search provider simulating remote API latency
struct CustomProviderShowcase: View {
    @ObservedObject var searchEngine: LocationSearchEngine
    @Binding var selectedLocation: LocationRecord?
    @State private var query = ""

    var body: some View {
        ShowcaseCard(title: "6. Custom Search Provider (API Simulator)") {
            VStack(alignment: .leading, spacing: 8) {
                IndonesianLocationAutocomplete(
                    value: $query,
                    onQueryChange: { query = $0 },
                    onLocationSelect: { loc in
                        selectedLocation = loc
                    },
                    texts: AutocompleteTexts(
                        placeholder: "Cari via Custom Provider..."
                    ),
                    searchProvider: { q in
                        // Simulate slow remote API latency (600ms)
                        try? await Task.sleep(nanoseconds: 600_000_000)
                        return await searchEngine.searchLocations(query: q)
                    }
                )

                HStack(spacing: 4) {
                    Image(systemName: "info.circle.fill")
                        .font(.caption2)
                        .foregroundColor(.orange)
                    Text("Simulates 600ms API latency via searchProvider")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
                .padding(.leading, 4)
            }
        }
    }
}
