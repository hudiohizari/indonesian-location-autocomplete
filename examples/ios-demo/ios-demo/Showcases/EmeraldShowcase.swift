/*
 * Created by Hudio Hizari
 * https://hizari.my.id/
 * https://github.com/hudiohizari/
 * hhizari@gmail.com
 */

import SwiftUI
import IndonesianLocationAutocomplete

/// Showcase 2: Emerald Mint themed component with green accent styling
struct EmeraldShowcase: View {
    @ObservedObject var searchEngine: LocationSearchEngine
    @Binding var selectedLocation: LocationRecord?
    @State private var query = ""

    var body: some View {
        ShowcaseCard(title: "2. Emerald Mint (Custom Format)") {
            VStack(alignment: .leading, spacing: 8) {
                IndonesianLocationAutocomplete(
                    value: $query,
                    onQueryChange: { query = $0 },
                    onLocationSelect: { loc in
                        selectedLocation = loc
                    },
                    searchEngine: searchEngine,
                    texts: AutocompleteTexts(
                        placeholder: "Search with emerald style..."
                    ),
                    formatSelectedLocation: { loc in
                        "\(loc.village) – \(loc.district) (\(loc.code))"
                    }
                )

                Text("Format: Village – District (Postcode)")
                    .font(.caption2)
                    .foregroundColor(Color(red: 0.06, green: 0.73, blue: 0.51))
                    .padding(.leading, 4)
            }
        }
    }
}
