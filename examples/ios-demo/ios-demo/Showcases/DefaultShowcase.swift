/*
 * Created by Hudio Hizari
 * https://hizari.my.id/
 * https://github.com/hudiohizari/
 * hhizari@gmail.com
 */

import SwiftUI
import IndonesianLocationAutocomplete

/// Showcase 1: Default out-of-the-box component with zero customization
struct DefaultShowcase: View {
    @ObservedObject var searchEngine: LocationSearchEngine
    @Binding var selectedLocation: LocationRecord?
    @State private var query = ""

    var body: some View {
        ShowcaseCard(title: "1. Default Clean") {
            IndonesianLocationAutocomplete(
                value: $query,
                onQueryChange: { query = $0 },
                onLocationSelect: { loc in
                    selectedLocation = loc
                },
                searchEngine: searchEngine
            )
        }
    }
}
