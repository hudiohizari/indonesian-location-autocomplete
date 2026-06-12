/*
 * Created by Hudio Hizari
 * https://hizari.my.id/
 * https://github.com/hudiohizari/
 * hhizari@gmail.com
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  StyleSheet,
  Keyboard,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native'
import { searchLocations } from '@hudiohizari/indonesian-location-autocomplete-core'
import type { LocationRecord, SearchOptions } from '@hudiohizari/indonesian-location-autocomplete-core'
import postcodeDataRaw from '@hudiohizari/indonesian-location-autocomplete-core/data'

const defaultPostcodeData = postcodeDataRaw as unknown as LocationRecord[]

export interface AutocompleteTexts {
  /** Placeholder text for the input. Default: "Search location..." */
  placeholder?: string
  /** Text shown when no results match. Default: "No locations found" */
  noResults?: string
}

export interface IndonesianLocationAutocompleteProps {
  /** Current input value (controlled). */
  value: string
  /** Called when the user selects a location from the dropdown. */
  onLocationSelect: (location: LocationRecord) => void
  /** Called on every keystroke with the raw query string. */
  onQueryChange?: (query: string) => void
  /** The full postcode dataset to search over. Defaults to the pre-bundled dataset. */
  data?: LocationRecord[]
  /** Pre-filtered search results for controlled remote search. Bypasses internal search engine. */
  searchResults?: LocationRecord[]
  /** Controlled loading state. If provided, overrides internal loading state. */
  isLoading?: boolean
  /** Debounce delay in milliseconds. Default: 300 */
  debounceMs?: number
  /** Search options (maxResults, minQueryLength, filter). */
  searchOptions?: SearchOptions
  /** Customizable text labels for i18n. */
  texts?: AutocompleteTexts
  /** Custom empty state rendering function. */
  renderEmptyState?: (query: string) => React.ReactNode
  /** Custom input icon. Set to null to hide leading icon. */
  leadingIcon?: React.ReactNode
  /** Custom loader element. Set to null to hide loading spinner. */
  loaderContent?: React.ReactNode
  /** Custom suggestion item renderer. */
  renderItem?: (location: LocationRecord, index: number, isActive: boolean) => React.ReactNode
  /** Custom selected location string formatter. */
  formatSelectedLocation?: (location: LocationRecord) => string
  /** Whether the input is disabled. */
  disabled?: boolean
  
  // React Native Styling Options
  /** Custom style for the main container View. */
  style?: StyleProp<ViewStyle>
  /** Custom style for the input wrapper (holds input, icon, loader). */
  inputWrapperStyle?: StyleProp<ViewStyle>
  /** Custom style for the TextInput element. */
  inputStyle?: StyleProp<TextStyle>
  /** Custom style for the dropdown list popup View. */
  dropdownStyle?: StyleProp<ViewStyle>
  /** Custom style for the suggestion list item touchable container. */
  itemStyle?: StyleProp<ViewStyle>
  /** Custom style for the primary text in the suggestion item. */
  itemTextStyle?: StyleProp<TextStyle>
  /** Custom style for the secondary text in the suggestion item. */
  itemSubTextStyle?: StyleProp<TextStyle>
  /** Custom style for the empty state wrapper View. */
  emptyStyle?: StyleProp<ViewStyle>
  /** Custom style for the empty state text. */
  emptyTextStyle?: StyleProp<TextStyle>
}

// Default native representation of a Map Pin without external dependencies
const DefaultMapPin = React.memo(() => (
  <View style={styles.defaultPinContainer}>
    <View style={styles.defaultPinTeardrop} />
    <View style={styles.defaultPinDot} />
  </View>
))

export function IndonesianLocationAutocomplete({
  value,
  onLocationSelect,
  onQueryChange,
  data = defaultPostcodeData,
  searchResults,
  isLoading,
  debounceMs = 300,
  searchOptions,
  texts,
  renderEmptyState,
  leadingIcon,
  loaderContent,
  renderItem,
  formatSelectedLocation,
  disabled = false,
  style,
  inputWrapperStyle,
  inputStyle,
  dropdownStyle,
  itemStyle,
  itemTextStyle,
  itemSubTextStyle,
  emptyStyle,
  emptyTextStyle,
}: IndonesianLocationAutocompleteProps) {
  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<LocationRecord[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [internalIsLoading, setInternalIsLoading] = useState(false)

  const isSelecting = useRef(false)
  const isUserTyping = useRef(false)
  const searchOptionsRef = useRef(searchOptions)
  searchOptionsRef.current = searchOptions
  const blurTimeoutRef = useRef<any>(null)

  // Cleanup blur timeout on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
      }
    }
  }, [])

  const placeholder = texts?.placeholder ?? 'Search location...'
  const noResultsText = texts?.noResults ?? 'No locations found'
  const minLen = searchOptions?.minQueryLength ?? 3

  const isCurrentlyLoading = isLoading !== undefined ? isLoading : internalIsLoading
  const activeResults = searchResults !== undefined ? searchResults : results

  // Sync external value changes (only when not actively typing/selecting)
  useEffect(() => {
    if (!isOpen) {
      isUserTyping.current = false
      setQuery(value)
      setInternalIsLoading(false)
    }
  }, [value, isOpen])

  // Debounced local search
  useEffect(() => {
    if (searchResults !== undefined) {
      return
    }

    if (isSelecting.current) {
      isSelecting.current = false
      return
    }

    if (!data || query.trim().length < minLen) {
      setResults([])
      setInternalIsLoading(false)
      return
    }

    setInternalIsLoading(true)

    const handler = setTimeout(() => {
      const matches = searchLocations(query, data, searchOptionsRef.current)
      setResults(matches)
      setInternalIsLoading(false)
      if (isUserTyping.current) {
        setIsOpen(true)
      }
    }, debounceMs)

    return () => clearTimeout(handler)
  }, [query, data, debounceMs, minLen, searchResults])

  const handleSelect = useCallback(
    (loc: LocationRecord) => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
      }
      isSelecting.current = true
      isUserTyping.current = false
      const formatted = formatSelectedLocation
        ? formatSelectedLocation(loc)
        : `${loc.village}, ${loc.district}, ${loc.regency}, ${loc.province} - ${loc.code}`
      setQuery(formatted)
      setIsOpen(false)
      Keyboard.dismiss()
      onQueryChange?.(formatted)
      onLocationSelect(loc)
    },
    [onLocationSelect, onQueryChange, formatSelectedLocation]
  )

  const handleChangeText = useCallback(
    (val: string) => {
      isUserTyping.current = true
      setQuery(val)
      onQueryChange?.(val)
      if (val.trim().length >= minLen) {
        setIsOpen(true)
        setInternalIsLoading(true)
      } else {
        setIsOpen(false)
        setInternalIsLoading(false)
      }
    },
    [onQueryChange, minLen]
  )

  const trimmedQuery = query.trim()
  const showNoResults = isOpen && trimmedQuery.length >= minLen && activeResults.length === 0 && !isCurrentlyLoading
  const hasIcon = leadingIcon !== null
  const showLoader = isCurrentlyLoading && loaderContent !== null

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.inputWrapper, inputWrapperStyle]}>
        {hasIcon && (
          <View style={styles.iconContainer}>
            {leadingIcon !== undefined ? leadingIcon : <DefaultMapPin />}
          </View>
        )}
        
        <TextInput
          style={[
            styles.input,
            !hasIcon && styles.inputNoIcon,
            showLoader && styles.inputWithLoader,
            inputStyle
          ]}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          value={query}
          editable={!disabled}
          onChangeText={handleChangeText}
          onFocus={() => {
            if (activeResults.length > 0) {
              setIsOpen(true)
            }
          }}
          onBlur={() => {
            blurTimeoutRef.current = setTimeout(() => {
              setIsOpen(false)
            }, 150)
          }}
        />

        {showLoader && (
          <View style={styles.loaderContainer}>
            {loaderContent !== undefined ? (
              loaderContent
            ) : (
              <ActivityIndicator size="small" color="#10b981" />
            )}
          </View>
        )}
      </View>

      {isOpen && activeResults.length > 0 && (
        <View style={[styles.dropdown, dropdownStyle]}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {activeResults.map((item, index) => (
              <TouchableOpacity
                key={`${item.code}-${item.village}-${index}`}
                style={[styles.item, itemStyle]}
                onPress={() => handleSelect(item)}
                activeOpacity={0.6}
              >
                {renderItem ? (
                  renderItem(item, index, false)
                ) : (
                  <>
                    <View style={styles.itemIconContainer}>
                      <DefaultMapPin />
                    </View>
                    <View style={styles.itemContent}>
                      <Text style={[styles.itemPrimary, itemTextStyle]}>
                        {item.village}, {item.district}
                      </Text>
                      <Text style={[styles.itemSecondary, itemSubTextStyle]}>
                        {item.regency}, {item.province} - {item.code}
                      </Text>
                    </View>
                  </>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {showNoResults && (
        <View style={[styles.dropdown, styles.emptyContainer, dropdownStyle, emptyStyle]}>
          {renderEmptyState ? (
            renderEmptyState(query)
          ) : (
            <Text style={[styles.noResults, emptyTextStyle]}>{noResultsText}</Text>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 99,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    position: 'relative',
    height: 48,
  },
  iconContainer: {
    position: 'absolute',
    left: 12,
    zIndex: 10,
  },
  loaderContainer: {
    position: 'absolute',
    right: 12,
    zIndex: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingLeft: 38,
    paddingRight: 16,
    color: '#1f2937',
    fontSize: 14,
  },
  inputNoIcon: {
    paddingLeft: 16,
  },
  inputWithLoader: {
    paddingRight: 38,
  },
  dropdown: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 220,
    overflow: 'hidden' as const,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
  },
  emptyContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemIconContainer: {
    marginRight: 10,
  },
  itemContent: {
    flex: 1,
  },
  itemPrimary: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  itemSecondary: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  noResults: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
  },
  
  // Styles for custom native teardrop pin
  defaultPinContainer: {
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultPinTeardrop: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9ca3af',
    borderBottomRightRadius: 0,
    transform: [{ rotate: '45deg' }],
  },
  defaultPinDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#ffffff',
    position: 'absolute',
    top: 3.5,
  },
})

export default IndonesianLocationAutocomplete
