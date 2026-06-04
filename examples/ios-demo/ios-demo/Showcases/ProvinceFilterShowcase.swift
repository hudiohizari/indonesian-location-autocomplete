/*
 * Created by Hudio Hizari
 * https://hizari.my.id/
 * https://github.com/hudiohizari/
 * hhizari@gmail.com
 */

import SwiftUI
import IndonesianLocationAutocomplete

/// Showcase 5: Dynamic province filter with selectable chip buttons
struct ProvinceFilterShowcase: View {
    @ObservedObject var searchEngine: LocationSearchEngine
    @Binding var selectedLocation: LocationRecord?
    @State private var query = ""
    @State private var selectedProvince = "Jawa Barat"

    private let provinces = ["Jawa Barat", "DKI Jakarta", "Jawa Tengah"]

    var body: some View {
        ShowcaseCard(title: "5. Dynamic Province Filter") {
            VStack(alignment: .leading, spacing: 12) {
                // Province chip selector
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(provinces, id: \.self) { province in
                            Button(action: {
                                withAnimation(.easeInOut(duration: 0.2)) {
                                    selectedProvince = province
                                    // Clear query when switching province
                                    query = ""
                                }
                            }) {
                                Text(province)
                                    .font(.caption)
                                    .fontWeight(selectedProvince == province ? .semibold : .regular)
                                    .padding(.horizontal, 14)
                                    .padding(.vertical, 7)
                                    .background(
                                        selectedProvince == province
                                            ? Color.blue
                                            : Color(uiColor: .tertiarySystemFill)
                                    )
                                    .foregroundColor(
                                        selectedProvince == province
                                            ? .white
                                            : .primary
                                    )
                                    .cornerRadius(20)
                            }
                        }
                    }
                }

                IndonesianLocationAutocomplete(
                    value: $query,
                    onQueryChange: { query = $0 },
                    onLocationSelect: { loc in
                        selectedLocation = loc
                    },
                    searchEngine: searchEngine,
                    texts: AutocompleteTexts(
                        placeholder: "Cari di \(selectedProvince)..."
                    ),
                    filter: { loc in loc.province == selectedProvince }
                )
            }
        }
    }
}
