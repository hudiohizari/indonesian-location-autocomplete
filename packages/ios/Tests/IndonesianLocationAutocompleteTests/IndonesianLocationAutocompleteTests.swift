/*
 * Created by Hudio Hizari
 * https://hizari.my.id/
 * https://github.com/hudiohizari/
 * hhizari@gmail.com
 */

import XCTest
@testable import IndonesianLocationAutocomplete

final class IndonesianLocationAutocompleteTests: XCTestCase {

    private let mockData: [LocationRecord] = [
        LocationRecord(
            code: 10110,
            village: "Gambir",
            district: "Gambir",
            regency: "Jakarta Pusat",
            province: "DKI Jakarta",
            latitude: -6.1764,
            longitude: 106.8272,
            elevation: 8,
            timezone: "WIB"
        ),
        LocationRecord(
            code: 10310,
            village: "Menteng",
            district: "Menteng",
            regency: "Jakarta Pusat",
            province: "DKI Jakarta",
            latitude: -6.1951,
            longitude: 106.8324,
            elevation: 12,
            timezone: "WIB"
        ),
        LocationRecord(
            code: 40132,
            village: "Dago",
            district: "Coblong",
            regency: "Bandung",
            province: "Jawa Barat",
            latitude: -6.8808,
            longitude: 107.6191,
            elevation: 750,
            timezone: "WIB"
        )
    ]

    func testSearchLocationsEmptyOrShortQuery() async {
        let engine = LocationSearchEngine(records: mockData)

        let emptyResults = await engine.searchLocations(query: "", minQueryLength: 3)
        XCTAssertEqual(emptyResults.count, 0)

        let spaceResults = await engine.searchLocations(query: "   ", minQueryLength: 3)
        XCTAssertEqual(spaceResults.count, 0)

        let shortResults = await engine.searchLocations(query: "da", minQueryLength: 3)
        XCTAssertEqual(shortResults.count, 0)
    }

    func testSearchLocationsByVillageCaseInsensitive() async {
        let engine = LocationSearchEngine(records: mockData)

        let lowerResults = await engine.searchLocations(query: "dago", minQueryLength: 3)
        XCTAssertEqual(lowerResults.count, 1)
        XCTAssertEqual(lowerResults[0].village, "Dago")

        let upperResults = await engine.searchLocations(query: "DAGO", minQueryLength: 3)
        XCTAssertEqual(upperResults.count, 1)
        XCTAssertEqual(upperResults[0].village, "Dago")
    }

    func testSearchLocationsByPostcode() async {
        let engine = LocationSearchEngine(records: mockData)

        let results = await engine.searchLocations(query: "40132", minQueryLength: 3)
        XCTAssertEqual(results.count, 1)
        XCTAssertEqual(results[0].code, 40132)
    }

    func testSearchLocationsMultiTermAndLogic() async {
        let engine = LocationSearchEngine(records: mockData)

        let results = await engine.searchLocations(query: "menteng jakarta", minQueryLength: 3)
        XCTAssertEqual(results.count, 1)
        XCTAssertEqual(results[0].village, "Menteng")

        let noResults = await engine.searchLocations(query: "dago jakarta", minQueryLength: 3)
        XCTAssertEqual(noResults.count, 0)
    }

    func testSearchLocationsNormalization() async {
        let engine = LocationSearchEngine(records: mockData)

        let commaResults = await engine.searchLocations(query: "jakarta, pusat", minQueryLength: 3)
        XCTAssertEqual(commaResults.count, 2)

        let dashResults = await engine.searchLocations(query: "dago-coblong", minQueryLength: 3)
        XCTAssertEqual(dashResults.count, 1)
        XCTAssertEqual(dashResults[0].village, "Dago")
    }

    func testSearchLocationsMaxResults() async {
        let engine = LocationSearchEngine(records: mockData)

        let results = await engine.searchLocations(query: "jakarta", maxResults: 1, minQueryLength: 3)
        XCTAssertEqual(results.count, 1)
    }

    func testSearchLocationsCustomMinQueryLength() async {
        let engine = LocationSearchEngine(records: mockData)

        let results = await engine.searchLocations(query: "da", minQueryLength: 2)
        XCTAssertEqual(results.count, 1)
        XCTAssertEqual(results[0].village, "Dago")
    }

    func testSearchLocationsCustomFilter() async {
        let engine = LocationSearchEngine(records: mockData)

        let unfiltered = await engine.searchLocations(query: "jakarta", minQueryLength: 3)
        XCTAssertEqual(unfiltered.count, 2)

        let filtered = await engine.searchLocations(query: "jakarta", minQueryLength: 3, filter: { loc in
            loc.village == "Gambir"
        })
        XCTAssertEqual(filtered.count, 1)
        XCTAssertEqual(filtered[0].village, "Gambir")
    }
}
