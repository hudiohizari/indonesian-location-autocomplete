/*
 * Created by Hudio Hizari
 * https://hizari.my.id/
 * https://github.com/hudiohizari/
 * hhizari@gmail.com
 */

import SwiftUI
import IndonesianLocationAutocomplete

/// Showcase 4: Custom empty state with localized Indonesian text
struct CustomEmptyShowcase: View {
    @ObservedObject var searchEngine: LocationSearchEngine
    @Binding var selectedLocation: LocationRecord?
    @State private var query = ""

    var body: some View {
        ShowcaseCard(title: "4. Custom Empty State & Localized Text") {
            IndonesianLocationAutocomplete(
                value: $query,
                onQueryChange: { query = $0 },
                onLocationSelect: { loc in
                    selectedLocation = loc
                },
                searchEngine: searchEngine,
                texts: AutocompleteTexts(
                    placeholder: "Cari dengan nama acak...",
                    noResults: "Lokasi tidak ditemukan"
                )
            )
        }
    }
}
