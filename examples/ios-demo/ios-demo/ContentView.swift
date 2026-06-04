/*
 * Created by Hudio Hizari
 * https://hizari.my.id/
 * https://github.com/hudiohizari/
 * hhizari@gmail.com
 */

import SwiftUI
import IndonesianLocationAutocomplete

struct ContentView: View {
    @StateObject private var searchEngine = LocationSearchEngine()
    @State private var selectedLocation: LocationRecord? = nil

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Header
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Indonesian Location Autocomplete")
                            .font(.title2)
                            .fontWeight(.bold)

                        Text("SwiftUI Customization Playground")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .padding(.horizontal)
                    .padding(.top, 8)

                    // 1. Default Clean
                    DefaultShowcase(searchEngine: searchEngine, selectedLocation: $selectedLocation)

                    // 2. Emerald Mint
                    EmeraldShowcase(searchEngine: searchEngine, selectedLocation: $selectedLocation)

                    // 3. Slate Dark Mode
                    DarkModeShowcase(searchEngine: searchEngine, selectedLocation: $selectedLocation)

                    // 4. Custom Empty State
                    CustomEmptyShowcase(searchEngine: searchEngine, selectedLocation: $selectedLocation)

                    // 5. Dynamic Province Filter
                    ProvinceFilterShowcase(searchEngine: searchEngine, selectedLocation: $selectedLocation)

                    // 6. Custom Search Provider (API Simulator)
                    CustomProviderShowcase(searchEngine: searchEngine, selectedLocation: $selectedLocation)

                    // Selected Location Details
                    if let loc = selectedLocation {
                        SelectedLocationCard(location: loc)
                            .transition(.opacity.combined(with: .move(edge: .bottom)))
                    }

                    Spacer(minLength: 40)
                }
                .padding(.vertical)
            }
            .navigationBarHidden(true)
            .background(Color(uiColor: .systemGroupedBackground))
            .animation(.easeInOut(duration: 0.3), value: selectedLocation != nil)
        }
        .navigationViewStyle(StackNavigationViewStyle())
        .task {
            do {
                try await searchEngine.initEngine()
            } catch {
                print("Failed to initialize search engine: \(error)")
            }
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
