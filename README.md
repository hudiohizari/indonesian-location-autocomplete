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

1. **Shared Pure Search Interface:** The core package exports a pure, stateless filtering engine `searchLocations(query, data)` which depends on zero platform-specific APIs.
2. **Platform-Native Data Loading:** Each native UI component handles JSON loading using its ecosystem's native asset pipeline:
   - **React (Web):** Dynamic/static ESM imports (`import data from ...`).
   - **React Native (Expo/Metro):** Bundled asset resolution (`require(...)`).
   - **Android (Kotlin):** Read from `assets/` folder using streaming JSON deserialization (`kotlinx.serialization`).
   - **Swift (iOS):** Read from the app bundle using `Foundation.Bundle` and `JSONDecoder`.

## Usage & Customization Guide

### 1. React Web Component

#### Installation
```bash
npm install @indonesian-location-autocomplete/core @indonesian-location-autocomplete/react
```

#### API Props Reference
- `value: string` (Required) - Controlled input value.
- `onLocationSelect: (location: LocationRecord) => void` (Required) - Invoked when selection occurs.
- `onQueryChange?: (query: string) => void` (Optional) - Invoked on input query keystrokes.
- `data?: LocationRecord[]` (Optional) - Postcode database. (Optional when using `searchResults`).
- `searchResults?: LocationRecord[]` (Optional) - Controlled pre-filtered search results (bypasses internal local search entirely, perfect for mock/live APIs).
- `isLoading?: boolean` (Optional) - Controlled loading spinner trigger.
- `debounceMs?: number` (Optional) - Delay in ms. Default is `300`.
- `searchOptions?: SearchOptions` (Optional) - Includes `maxResults`, `minQueryLength`, and a custom callback `filter: (loc: LocationRecord) => boolean` to restrict query suggestions dynamically.
- `texts?: { placeholder?: string; noResults?: string }` (Optional) - Custom translations.
- `leadingIcon?: React.ReactNode` (Optional) - Custom input icon. Set to `null` to hide.
- `loaderContent?: React.ReactNode` (Optional) - Custom loading content component. Set to `null` to hide.
- `renderItem?: (loc: LocationRecord, index: number, active: boolean) => React.ReactNode` (Optional) - Custom cell suggestion layout builder.
- `renderEmptyState?: (query: string) => React.ReactNode` (Optional) - Custom empty state indicator layout builder.
- `formatSelectedLocation?: (loc: LocationRecord) => string` (Optional) - Format value mapping upon selection.
- `className?: string` (Optional) - Input CSS class.
- `containerClassName?: string` (Optional) - Container CSS class.
- `containerStyle?: React.CSSProperties` (Optional) - Container inline styles.
- `dropdownClassName?: string` (Optional) - Dropdown wrapper CSS class.
- `dropdownStyle?: React.CSSProperties` (Optional) - Dropdown wrapper inline styles.

#### Presets & Usecases Examples

##### A. Standard Local JSON Search Mode
```tsx
import { useState } from 'react'
import { IndonesianLocationAutocomplete } from '@indonesian-location-autocomplete/react'
import postcodeData from '@indonesian-location-autocomplete/core/data'

function StandardSearch() {
  const [value, setValue] = useState('')
  return (
    <IndonesianLocationAutocomplete
      value={value}
      data={postcodeData}
      onQueryChange={setValue}
      onLocationSelect={(loc) => setValue(`${loc.village}, ${loc.district}`)}
    />
  )
}
```

##### B. Dynamic Parent Filtering (Chained Dropdowns)
```tsx
import { useState } from 'react'
import { IndonesianLocationAutocomplete } from '@indonesian-location-autocomplete/react'
import postcodeData from '@indonesian-location-autocomplete/core/data'

function ChainedDropdowns() {
  const [value, setValue] = useState('')
  const [selectedProvince, setSelectedProvince] = useState('Jawa Barat')

  return (
    <IndonesianLocationAutocomplete
      value={value}
      data={postcodeData}
      onQueryChange={setValue}
      onLocationSelect={(loc) => setValue(`${loc.village}, ${loc.district}`)}
      searchOptions={{
        filter: (loc) => loc.province === selectedProvince
      }}
    />
  )
}
```

##### C. Controlled Remote API Search (Zero 15MB file loads in browser)
```tsx
import { useState, useEffect } from 'react'
import { IndonesianLocationAutocomplete } from '@indonesian-location-autocomplete/react'

function RemoteAPISearch() {
  const [value, setValue] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (value.length < 3) return
    setLoading(true)
    fetch(`/api/locations?q=${value}`)
      .then(res => res.json())
      .then(data => {
        setResults(data)
        setLoading(false)
      })
  }, [value])

  return (
    <IndonesianLocationAutocomplete
      value={value}
      onQueryChange={setValue}
      onLocationSelect={(loc) => setValue(loc.village)}
      searchResults={results}
      isLoading={loading}
    />
  )
}
```

##### D. Visual Styling Customizations via CSS variables
```css
/* Customize your app stylesheet using clean fallback tokens */
.my-custom-input {
  --ila-input-border-radius: 12px;
  --ila-focus-border-color: #10b981;
  --ila-dropdown-bg: #1f2937;
  --ila-item-primary-color: #f3f4f6;
  --ila-loader-color: #10b981;
}
```

---

### 2. Android Jetpack Compose Component

#### Installation
```kotlin
implementation("id.my.hizari.indonesianlocation:autocomplete:1.0.0")
```

#### API Parameters Reference
- `value: String` (Required) - Controlled query.
- `onQueryChange: (String) -> Unit` (Required) - Keystroke callback.
- `onLocationSelect: (LocationRecord) -> Unit` (Required) - Selection callback.
- `searchEngine: LocationSearchEngine?` (Optional) - Default database helper. (Optional when using `searchProvider`).
- `maxResults: Int` - Maximum rows.
- `minQueryLength: Int` - Minimum typing length.
- `debounceMs: Long` - Search delay in ms.
- `texts: AutocompleteTexts` - Placeholder & Empty translations.
- `shape: Shape` - Input border shape.
- `colors: TextFieldColors` - Input text field colors.
- `dropdownModifier: Modifier` - Styles applied to the dropdown container.
- `leadingIcon: @Composable (() -> Unit)?` - Customize or hide leading icon.
- `loaderContent: @Composable (() -> Unit)?` - Customize or hide loading spinner.
- `itemContent: @Composable (ColumnScope.(LocationRecord) -> Unit)?` - Custom item layout builder.
- `emptyContent: @Composable (ColumnScope.(query: String) -> Unit)?` - Custom empty state layout builder.
- `formatSelectedLocation: (LocationRecord) -> String` - Mapping of selected records.
- `filter: ((LocationRecord) -> Boolean)?` - Filters search results dynamically.
- `searchProvider: (suspend (String) -> List<LocationRecord>)?` - Controlled search provider (runs Room/SQL/API off-thread).

#### Presets & Usecases Examples

##### A. Standard Search
```kotlin
val searchEngine = remember { LocationSearchEngine(context) }
var query by remember { mutableStateOf("") }

IndonesianLocationAutocomplete(
    value = query,
    onQueryChange = { query = it },
    onLocationSelect = { loc -> query = loc.village },
    searchEngine = searchEngine
)
```

##### B. Dynamic Parent Filter
```kotlin
val searchEngine = remember { LocationSearchEngine(context) }
var query by remember { mutableStateOf("") }
var targetProvince by remember { mutableStateOf("DKI Jakarta") }

IndonesianLocationAutocomplete(
    value = query,
    onQueryChange = { query = it },
    onLocationSelect = { loc -> query = loc.village },
    searchEngine = searchEngine,
    filter = { loc -> loc.province == targetProvince }
)
```

##### C. Custom Search Provider (Room / Background API Querying)
```kotlin
var query by remember { mutableStateOf("") }

IndonesianLocationAutocomplete(
    value = query,
    onQueryChange = { query = it },
    onLocationSelect = { loc -> query = loc.village },
    searchProvider = { q ->
        // Executes off-thread to search background REST API or Room Database
        myLocationDao.searchLocs(q)
    }
)
```

---

## Tested & Supported Platforms

- [x] React 18+ / React 19 (Web)
- [ ] React Native (Android)
- [ ] React Native (iOS)
- [x] Android Jetpack Compose (Kotlin 1.9+, Android SDK 24+)
- [ ] iOS SwiftUI (iOS 15+, Swift 5.9+) - Future Roadmap

## Distribution & Publishing Targets

To ensure simple installation across different tech stacks, native packages are published directly to the standard registry of each platform:

- **React JS & React Native:** [npm Registry](https://www.npmjs.com/)
- **Android Jetpack Compose:** [Maven Central](https://search.maven.org/) / [JitPack](https://jitpack.io/)

## Library Deployment Status

- [ ] `@indonesian-location-autocomplete/react` (npm)
- [ ] `@indonesian-location-autocomplete/react-native` (npm)
- [ ] `com.github.indonesian-location-autocomplete` (Maven Central / JitPack)

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
   ```
3. Publish the packages:
   ```bash
   npm publish --workspace=packages/react --access public
   ```

### 2. Android Jetpack Compose (JitPack / Maven Central)

Android packages are distributed via JitPack for streamlined GitHub release tag builds:

1. Apply the `maven-publish` plugin in `packages/android/build.gradle`.
2. Configure a `jitpack.yml` at the root of the project if specific JDK versions are required.
3. Publish by creating a new GitHub Release.


---

## License

MIT © 2026
