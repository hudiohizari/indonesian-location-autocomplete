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
                    placeholder: "Cari dengan nama acak..."
                ),
                renderEmptyState: { q in
                    AnyView(
                        VStack(spacing: 8) {
                            Image(systemName: "exclamationmark.circle.fill")
                                .foregroundColor(.red)
                                .font(.system(size: 24))
                            
                            Text("No Matches Found")
                                .font(.subheadline)
                                .fontWeight(.bold)
                                .foregroundColor(.primary)
                            
                            Text("We couldn't find any location matching \"\(q)\"")
                                .font(.caption)
                                .foregroundColor(.secondary)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal)
                        }
                        .padding(.vertical, 16)
                        .frame(maxWidth: .infinity)
                    )
                }
            )
        }
    }
}
