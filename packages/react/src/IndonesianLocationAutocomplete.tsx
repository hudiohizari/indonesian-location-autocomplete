'use client'

/*
 * Created by Hudio Hizari
 * https://hizari.my.id/
 * https://github.com/hudiohizari/
 * hhizari@gmail.com
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { searchLocations } from '@indonesian-location-autocomplete/core'
import type { LocationRecord, SearchOptions } from '@indonesian-location-autocomplete/core'
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
  /** The full postcode dataset to search over. */
  data: LocationRecord[]
  /** Debounce delay in milliseconds. Default: 300 */
  debounceMs?: number
  /** Search options (maxResults, minQueryLength). */
  searchOptions?: SearchOptions
  /** Customizable text labels for i18n. */
  texts?: AutocompleteTexts
  /** Additional CSS class for the input element. */
  className?: string
  /** Additional CSS class for the container element. */
  containerClassName?: string
  /** Inline styles for the container element. */
  containerStyle?: React.CSSProperties
  /** Whether the input is disabled. */
  disabled?: boolean
}

/**
 * A fully local Indonesian location autocomplete component for React.
 *
 * Searches the provided postcode dataset in-browser with debounced
 * multi-term matching. Supports keyboard navigation, click-outside
 * dismissal, and full i18n customization.
 */
export default function IndonesianLocationAutocomplete({
  value,
  onLocationSelect,
  onQueryChange,
  data,
  debounceMs = 300,
  searchOptions,
  texts,
  className,
  containerClassName,
  containerStyle,
  disabled = false,
}: IndonesianLocationAutocompleteProps) {
  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<LocationRecord[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const isSelecting = useRef(false)
  const isUserTyping = useRef(false)

  const placeholder = texts?.placeholder ?? 'Search location...'
  const noResultsText = texts?.noResults ?? 'No locations found'

  // Sync external value changes (only when not actively typing)
  useEffect(() => {
    if (!isOpen) {
      isUserTyping.current = false
      setQuery(value)
    }
  }, [value, isOpen])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search
  useEffect(() => {
    if (isSelecting.current) {
      isSelecting.current = false
      return
    }

    const handler = setTimeout(() => {
      const matches = searchLocations(query, data, searchOptions)
      setResults(matches)
      if (isUserTyping.current && matches.length > 0) {
        setIsOpen(true)
      }
      setActiveIndex(-1)
    }, debounceMs)

    return () => clearTimeout(handler)
  }, [query, data, debounceMs, searchOptions])

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
      const formatted = `${loc.village}, ${loc.district}, ${loc.regency}, ${loc.province} - ${loc.code}`
      setQuery(formatted)
      setIsOpen(false)
      setActiveIndex(-1)
      onLocationSelect(loc)
    },
    [onLocationSelect]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex(prev => (prev > 0 ? prev - 1 : results.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < results.length) {
          handleSelect(results[activeIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setActiveIndex(-1)
        break
    }
  }

  const minLen = searchOptions?.minQueryLength ?? 3
  const showNoResults = isOpen && query.trim().length >= minLen && results.length === 0

  return (
    <div
      className={`${styles.container} ${containerClassName || ''}`}
      style={containerStyle}
      ref={containerRef}
    >
      <div className={styles.inputWrapper}>
        <input
          type="text"
          className={`${styles.input} ${className || ''}`}
          placeholder={placeholder}
          value={query}
          disabled={disabled}
          onChange={e => {
            isUserTyping.current = true
            setQuery(e.target.value)
            onQueryChange?.(e.target.value)
            if (!isOpen && e.target.value.length >= minLen) setIsOpen(true)
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true)
          }}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-haspopup="listbox"
        />
        {/* Inline SVG map pin - no icon library dependency */}
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
      </div>

      {isOpen && results.length > 0 && (
        <ul className={styles.dropdown} ref={listRef} role="listbox">
          {results.map((loc, idx) => (
            <li
              key={`${loc.code}-${loc.village}-${idx}`}
              data-item
              className={`${styles.item} ${idx === activeIndex ? styles.itemActive : ''}`}
              onClick={() => handleSelect(loc)}
              onMouseEnter={() => setActiveIndex(idx)}
              role="option"
              aria-selected={idx === activeIndex}
            >
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
            </li>
          ))}
        </ul>
      )}

      {showNoResults && (
        <div className={styles.dropdown}>
          <div className={styles.noResults}>{noResultsText}</div>
        </div>
      )}
    </div>
  )
}
