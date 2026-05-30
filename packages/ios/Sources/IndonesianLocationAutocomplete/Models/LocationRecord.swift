/*
 * Created by Hudio Hizari
 * https://hizari.my.id/
 * https://github.com/hudiohizari/
 * hhizari@gmail.com
 */

import Foundation

public struct LocationRecord: Codable, Identifiable, Hashable {
    public let code: Int
    public let village: String
    public let district: String
    public let regency: String
    public let province: String
    public let latitude: Double
    public let longitude: Double
    public let elevation: Int
    public let timezone: String

    // Computed property to conform to Identifiable in SwiftUI lists
    public var id: String {
        return "\(code)-\(village)-\(district)"
    }

    // Cache search representation internally
    internal var searchStr: String {
        return "\(village)\n\(district)\n\(regency)\n\(province)\n\(code)".lowercased()
    }

    public init(
        code: Int,
        village: String = "",
        district: String = "",
        regency: String = "",
        province: String = "",
        latitude: Double = 0.0,
        longitude: Double = 0.0,
        elevation: Int = 0,
        timezone: String = ""
    ) {
        self.code = code
        self.village = village
        self.district = district
        self.regency = regency
        self.province = province
        self.latitude = latitude
        self.longitude = longitude
        self.elevation = elevation
        self.timezone = timezone
    }
}
