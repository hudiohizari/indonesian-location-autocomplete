# Indonesian Location Autocomplete

A robust, lightweight, and blazing fast multi-platform location autocomplete library for Indonesian administrative areas (Province, Regency, District, Village, and Postcode).

Designed from the ground up to be **fully customizable**, it gives you total control over text translations, input styles, loader components, dropdown layouts, and theme tokens on every single supported platform, allowing it to seamlessly match your app's unique design system.

This monorepo contains native implementations for all major frontend frameworks and mobile platforms:

- **React JS (Web):** Modern, fully styled custom input with micro-animations and keyboard navigation support.
- **React Native (Mobile):** Sleek, touch-friendly dropdown/autocomplete list optimized for iOS and Android.
- **Android Jetpack Compose (Kotlin):** Premium native Compose UI component with material elements and smooth entry transitions.
- **Swift (iOS/SwiftUI):** Native Declarative SwiftUI component with standard iOS layouts.

## Monorepo Layout

```
indonesian-location-autocomplete/
├── README.md
├── packages/
│   ├── core/                  # Core package (logic & raw data)
│   │   ├── package.json
│   │   └── src/
│   │       ├── index.ts       # Shared logic (debounced search engine)
│   │       └── data/
│   │           └── indonesia-postcodes.json # Raw postcode database
│   ├── react/                 # React JS UI implementation
│   ├── react-native/          # React Native mobile implementation
│   ├── android/               # Kotlin Jetpack Compose library
│   └── ios/                   # Swift / SwiftUI library package
└── examples/
    ├── react-demo/            # React JS Web playground
    ├── react-native-demo/     # React Native Expo App playground
    ├── android-demo/          # Native Kotlin Jetpack Compose App
    └── ios-demo/              # Native Swift / SwiftUI Xcode App
```

## Example Projects

To see the components in action, explore the playground apps in the `examples/` directory:

- **[React Web Demo](./examples/react-demo)** - A modern Next.js/Vite React app showing custom styles, text localization, and theme overrides.
- **[React Native Demo](./examples/react-native-demo)** - An Expo-based mobile app showing custom dropdown sheets and responsive input sizing.
- **[Android Jetpack Compose Demo](./examples/android-demo)** - A native Kotlin app showcasing material themes and soft-keyboard focus interactions.
- **[iOS SwiftUI Demo](./examples/ios-demo)** - A native Xcode SwiftUI app showing simple form binding and light/dark mode adaptation.

## How It Works

The autocomplete engine searches over the official Indonesian Postcode Database.
Each record contains:

- `code` (Postcode number)
- `village` (Kelurahan)
- `district` (Kecamatan)
- `regency` (Kota/Kabupaten)
- `province` (Provinsi)

The search query is debounced and queried locally or via an API client to instantly fetch matches matching the hierarchy query.

### 🌎 Cross-Platform Architecture & Asset Compatibility

To guarantee that this library works flawlessly on **every single platform** without dependency conflicts, we decoupled the **search logic** from the **asset loading**:

1. **Shared Pure Search Interface:** The core package exports a pure, stateless filtering engine `searchLocationLocal(query, data)` which depends on zero platform-specific APIs.
2. **Platform-Native Data Loading:** Each native UI component handles JSON loading using its ecosystem's native asset pipeline:
   - **React (Web):** Dynamic/static ESM imports (`import data from ...`).
   - **React Native (Expo/Metro):** Bundled asset resolution (`require(...)`).
   - **Android (Kotlin):** Read from `assets/` or raw resource streams using standard JSON parser (e.g. Gson or kotlinx.serialization).
   - **iOS (Swift):** Read from standard App/Package resource bundle using `JSONDecoder`.

---

## Tested & Supported Platforms

- [x] React 18+ / React 19 (Web)
- [ ] React Native (Android)
- [ ] React Native (iOS)
- [x] Android Jetpack Compose (Kotlin 1.9+, Android SDK 24+)
- [ ] iOS SwiftUI (iOS 15+, Swift 5.9+)

---

## Distribution & Publishing Targets

To ensure simple installation across different tech stacks, native packages are published directly to the standard registry of each platform:

- **React JS & React Native:** [npm Registry](https://www.npmjs.com/)
- **Android Jetpack Compose:** [Maven Central](https://search.maven.org/) / [JitPack](https://jitpack.io/)
- **Swift / iOS:** [Swift Package Manager (SPM)](https://swift.org/package-manager/)

## Library Deployment Status

- [ ] `@indonesian-location-autocomplete/react` (npm)
- [ ] `@indonesian-location-autocomplete/react-native` (npm)
- [ ] `com.github.indonesian-location-autocomplete` (Maven Central / JitPack)
- [ ] `IndonesianLocationAutocomplete` (Swift Package Manager / CocoaPods)

---

## Deployment & Publishing Guide

### 1. React & React Native (npm)

We build to ES modules and CommonJS and publish to npm:

1. Build the package:
   ```bash
   npm run build --workspace=packages/react
   ```
2. Log in and publish:
   ```bash
   npm login
   npm publish --workspace=packages/react --access public
   ```

### 2. Android Jetpack Compose (JitPack / Maven Central)

Android packages are distributed via JitPack for streamlined GitHub release tag builds:

1. Apply the `maven-publish` plugin in `packages/android/build.gradle`.
2. Configure a `jitpack.yml` at the root of the project if specific JDK versions are required.
3. Publish by creating a new GitHub Release.

### 3. Swift / iOS (Swift Package Manager)

SPM parses the Swift Package directly from git tags:

1. Ensure `Package.swift` is valid and points to the native Swift target directory.
2. Push a new semantic git tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

---

## License

MIT © 2026
