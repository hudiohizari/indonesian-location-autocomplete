/*
 * Created by Hudio Hizari
 * https://hizari.my.id/
 * https://github.com/hudiohizari/
 * hhizari@gmail.com
 */

import SwiftUI
import IndonesianLocationAutocomplete

/// Displays the full details of the currently selected location
struct SelectedLocationCard: View {
    let location: LocationRecord

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Selected Location Details")
                .font(.headline)
                .fontWeight(.bold)
                .foregroundColor(.white)

            Divider()
                .background(Color.white.opacity(0.3))

            Group {
                detailRow(label: "Postcode", value: "\(location.code)")
                detailRow(label: "Village", value: location.village)
                detailRow(label: "District", value: location.district)
                detailRow(label: "Regency", value: location.regency)
                detailRow(label: "Province", value: location.province)
                detailRow(label: "Coordinates", value: "\(location.latitude), \(location.longitude)")
                detailRow(label: "Timezone", value: location.timezone)
                detailRow(label: "Elevation", value: "\(location.elevation)m")
            }
        }
        .padding(16)
        .background(
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.25, green: 0.47, blue: 0.85),
                    Color(red: 0.40, green: 0.30, blue: 0.76)
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .cornerRadius(12)
        .shadow(color: Color(red: 0.25, green: 0.47, blue: 0.85).opacity(0.3), radius: 10, x: 0, y: 4)
        .padding(.horizontal)
    }

    private func detailRow(label: String, value: String) -> some View {
        HStack(alignment: .top) {
            Text(label + ":")
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundColor(Color.white.opacity(0.7))
                .frame(width: 90, alignment: .leading)

            Text(value)
                .font(.caption)
                .foregroundColor(.white)
        }
    }
}
