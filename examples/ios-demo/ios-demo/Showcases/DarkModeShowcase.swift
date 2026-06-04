/*
 * Created by Hudio Hizari
 * https://hizari.my.id/
 * https://github.com/hudiohizari/
 * hhizari@gmail.com
 */

import SwiftUI
import IndonesianLocationAutocomplete

/// Showcase 3: Dark mode card with contrasting color scheme
struct DarkModeShowcase: View {
    @ObservedObject var searchEngine: LocationSearchEngine
    @Binding var selectedLocation: LocationRecord?
    @State private var query = ""

    var body: some View {
        ShowcaseCard(
            title: "3. Slate Dark Mode",
            backgroundColor: Color(red: 0.12, green: 0.16, blue: 0.23),
            titleColor: Color(red: 0.97, green: 0.98, blue: 0.99)
        ) {
            IndonesianLocationAutocomplete(
                value: $query,
                onQueryChange: { query = $0 },
                onLocationSelect: { loc in
                    selectedLocation = loc
                },
                searchEngine: searchEngine,
                texts: AutocompleteTexts(
                    placeholder: "Search in dark mode..."
                )
            )
            .colorScheme(.dark)
        }
    }
}
