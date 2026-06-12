'use client'

/*
 * Created by Hudio Hizari
 * https://hizari.my.id/
 * https://github.com/hudiohizari/
 * hhizari@gmail.com
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { searchLocations } from '@hudiohizari/indonesian-location-autocomplete-core'
import type { LocationRecord, SearchOptions } from '@hudiohizari/indonesian-location-autocomplete-core'
import styles from './IndonesianLocationAutocomplete.module.css'

/** Props for customizing displayed text (i18n support). */
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
  /** Custom input icon (e.g. search icon). Set to null to hide leading icon. */
  leadingIcon?: React.ReactNode
  /** Custom loader element. Set to null to hide loading spinner. */
  loaderContent?: React.ReactNode
  /** Custom suggestion item renderer. */
  renderItem?: (location: LocationRecord, index: number, isActive: boolean) => React.ReactNode
  /** Custom selected location string formatter. */
  formatSelectedLocation?: (location: LocationRecord) => string
  /** Additional CSS class for the input element. */
  className?: string
  /** Additional CSS class for the container element. */
  containerClassName?: string
  /** Inline styles for the container element. */
  containerStyle?: React.CSSProperties
  /** Additional CSS class for the dropdown menu list. */
  dropdownClassName?: string
  /** Inline styles for the dropdown menu list. */
  dropdownStyle?: React.CSSProperties
  /** Whether the input is disabled. */
  disabled?: boolean
}

/**
 * A fully customizable Indonesian location autocomplete component for React.
 *
 * Searches the provided postcode dataset in-browser with debounced
 * multi-term matching. Defaults to the pre-bundled 15.7MB database.
 * Supports keyboard navigation, click-outside dismissal, and full i18n customization.
 * Can also be controlled externally via searchResults/isLoading for custom database or API search.
 */
export function IndonesianLocationAutocomplete({
  value,
  onLocationSelect,
  onQueryChange,
  data,
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
  className,
  containerClassName,
  containerStyle,
  dropdownClassName,
  dropdownStyle,
  disabled = false,
}: IndonesianLocationAutocompleteProps) {
  const [internalData, setInternalData] = useState<LocationRecord[]>([])
  const [isDataLoading, setIsDataLoading] = useState(false)

  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<LocationRecord[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [internalIsLoading, setInternalIsLoading] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const isSelecting = useRef(false)
  const isUserTyping = useRef(false)
  const searchOptionsRef = useRef(searchOptions)
  searchOptionsRef.current = searchOptions

  const placeholder = texts?.placeholder ?? 'Search location...'
  const noResultsText = texts?.noResults ?? 'No locations found'
  const minLen = searchOptions?.minQueryLength ?? 3

  const isCurrentlyLoading = isLoading !== undefined
    ? isLoading
    : (internalIsLoading || isDataLoading)
  const activeResults = searchResults !== undefined ? searchResults : results
  const activeData = data !== undefined ? data : internalData

  // Dynamic load local database if using internal search mode and data is not loaded yet
  useEffect(() => {
    if (searchResults === undefined && data === undefined && internalData.length === 0 && !isDataLoading) {
      setIsDataLoading(true)
      import('@hudiohizari/indonesian-location-autocomplete-core/data')
        .then((module) => {
          setInternalData(module.default as unknown as LocationRecord[])
          setIsDataLoading(false)
        })
        .catch((err) => {
          console.error('Failed to load Indonesian location database dynamically:', err)
          setIsDataLoading(false)
        })
    }
  }, [data, searchResults, internalData, isDataLoading])

  // Sync external value changes (only when not actively typing)
  useEffect(() => {
    if (!isOpen) {
      isUserTyping.current = false
      setQuery(value)
      setInternalIsLoading(false)
    }
  }, [value, isOpen])

  // Close dropdown on click or focus outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }
    const handleFocusOutside = (e: FocusEvent) => {
      if (containerRef.current && !containerRef.current.contains(document.activeElement)) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('focusin', handleFocusOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('focusin', handleFocusOutside)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    if (searchResults !== undefined) {
      // Bypassed: using controlled searchResults
      return
    }

    if (isSelecting.current) {
      isSelecting.current = false
      return
    }

    if (!activeData || activeData.length === 0 || query.trim().length < minLen) {
      setResults([])
      setInternalIsLoading(false)
      return
    }

    // Set loading immediately on query change
    setInternalIsLoading(true)

    const handler = setTimeout(() => {
      const matches = searchLocations(query, activeData, searchOptionsRef.current)
      setResults(matches)
      setInternalIsLoading(false)
      if (isUserTyping.current) {
        setIsOpen(true)
      }
      setActiveIndex(-1)
    }, debounceMs)

    return () => clearTimeout(handler)
  }, [query, activeData, debounceMs, minLen, searchResults])

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-item]')
      items[activeIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  const handleSelect = useCallback(
    (loc: LocationRecord) => {
      isSelecting.current = true
      const formatted = formatSelectedLocation
        ? formatSelectedLocation(loc)
        : `${loc.village}, ${loc.district}, ${loc.regency}, ${loc.province} - ${loc.code}`
      setQuery(formatted)
      setIsOpen(false)
      setActiveIndex(-1)
      onQueryChange?.(formatted)
      onLocationSelect(loc)
    },
    [onLocationSelect, onQueryChange, formatSelectedLocation]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || activeResults.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex(prev => (prev < activeResults.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex(prev => (prev > 0 ? prev - 1 : activeResults.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < activeResults.length) {
          handleSelect(activeResults[activeIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setActiveIndex(-1)
        break
    }
  }

  const showNoResults = isOpen && query.trim().length >= minLen && activeResults.length === 0 && !isCurrentlyLoading
  const hasIcon = leadingIcon !== null
  const showLoader = isCurrentlyLoading && loaderContent !== null

  return (
    <div
      className={`${styles.container} ${containerClassName || ''}`}
      style={containerStyle}
      ref={containerRef}
    >
      <div className={styles.inputWrapper}>
        <input
          type="text"
          className={`${styles.input} ${!hasIcon ? styles.inputNoIcon : ''} ${className || ''}`}
          placeholder={placeholder}
          value={query}
          disabled={disabled}
          onChange={e => {
            const val = e.target.value
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
          }}
          onFocus={() => {
            if (activeResults.length > 0) setIsOpen(true)
          }}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-haspopup="listbox"
        />
        {hasIcon && (
          leadingIcon !== undefined ? (
            <div className={styles.inputIcon}>{leadingIcon}</div>
          ) : (
            <svg
              className={styles.inputIcon}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          )
        )}
        {showLoader && (
          loaderContent !== undefined ? (
            <div className={styles.loaderWrapper}>{loaderContent}</div>
          ) : (
            <div className={styles.loader}></div>
          )
        )}
      </div>

      {isOpen && activeResults.length > 0 && (
        <ul
          className={`${styles.dropdown} ${dropdownClassName || ''}`}
          style={dropdownStyle}
          ref={listRef}
          role="listbox"
        >
          {activeResults.map((loc, idx) => (
            <li
              key={`${loc.code}-${loc.village}-${idx}`}
              data-item
              className={`${styles.item} ${idx === activeIndex ? styles.itemActive : ''}`}
              onClick={() => handleSelect(loc)}
              onMouseEnter={() => setActiveIndex(idx)}
              role="option"
              aria-selected={idx === activeIndex}
            >
              {renderItem ? (
                renderItem(loc, idx, idx === activeIndex)
              ) : (
                <>
                  <svg
                    className={styles.itemIcon}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <div className={styles.itemContent}>
                    <div className={styles.itemPrimary}>
                      {loc.village}, {loc.district}
                    </div>
                    <div className={styles.itemSecondary}>
                      {loc.regency}, {loc.province} - {loc.code}
                    </div>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {showNoResults && (
        <div
          className={`${styles.dropdown} ${dropdownClassName || ''}`}
          style={dropdownStyle}
        >
          {renderEmptyState ? (
            renderEmptyState(query)
          ) : (
            <div className={styles.noResults}>{noResultsText}</div>
          )}
        </div>
      )}
    </div>
  )
}

export default IndonesianLocationAutocomplete
