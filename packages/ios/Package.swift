// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "IndonesianLocationAutocomplete",
    platforms: [
        .iOS(.v15)
    ],
    products: [
        .library(
            name: "IndonesianLocationAutocomplete",
            targets: ["IndonesianLocationAutocomplete"]
        ),
    ],
    dependencies: [],
    targets: [
        .target(
            name: "IndonesianLocationAutocomplete",
            dependencies: [],
            resources: [
                .process("Resources")
            ]
        ),
        .testTarget(
            name: "IndonesianLocationAutocompleteTests",
            dependencies: ["IndonesianLocationAutocomplete"]
        ),
    ]
)
