/*
 * Created by Hudio Hizari
 * https://hizari.my.id/
 * https://github.com/hudiohizari/
 * hhizari@gmail.com
 */

import React, { useState, useEffect, useCallback } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { IndonesianLocationAutocomplete } from '@hudiohizari/indonesian-location-autocomplete'
import type { LocationRecord } from '@hudiohizari/indonesian-location-autocomplete-core'
import postcodeDataRaw from '@hudiohizari/indonesian-location-autocomplete-core/data'

const postcodeData = postcodeDataRaw as unknown as LocationRecord[]

interface PreviewState {
  value: string
  selected: LocationRecord | null
}

const PROVINCES = ['Jawa Barat', 'DKI Jakarta', 'Jawa Tengah', 'Banten']

export default function App() {
  const [themes, setThemes] = useState<Record<string, PreviewState>>({
    default: { value: '', selected: null },
    dark: { value: '', selected: null },
    emerald: { value: '', selected: null },
    customEmpty: { value: '', selected: null },
    filtered: { value: '', selected: null },
    remote: { value: '', selected: null },
  })

  // Cascading/Chained dynamic filter state
  const [selectedProvince, setSelectedProvince] = useState('Jawa Barat')

  // Controlled Remote/API Search State
  const [remoteQuery, setRemoteQuery] = useState('')
  const [remoteResults, setRemoteResults] = useState<LocationRecord[]>([])
  const [remoteLoading, setRemoteLoading] = useState(false)

  // Track the most recently selected location across all preview cards
  const [lastSelected, setLastSelected] = useState<LocationRecord | null>(null)

  // Simulation of Remote API call on remoteQuery change
  useEffect(() => {
    if (remoteQuery.trim().length < 3) {
      setRemoteResults([])
      setRemoteLoading(false)
      return
    }

    setRemoteLoading(true)
    const handler = setTimeout(() => {
      // Simulate remote lookup over the dataset
      const queryLower = remoteQuery.toLowerCase()
      const matches = postcodeData
        .filter((item: LocationRecord) => {
          const content = `${item.village} ${item.district} ${item.regency} ${item.province} ${item.code}`.toLowerCase()
          return content.includes(queryLower)
        })
        .slice(0, 5)

      setRemoteResults(matches)
      setRemoteLoading(false)
    }, 600) // Simulated network latency

    return () => clearTimeout(handler)
  }, [remoteQuery])

  const formatLocation = useCallback((loc: LocationRecord) => {
    return `${loc.village}, ${loc.district}, ${loc.regency}, ${loc.province} - ${loc.code}`
  }, [])

  const updateThemeState = useCallback((key: string, value: string, selected: LocationRecord | null) => {
    setThemes((prev) => ({
      ...prev,
      [key]: { value, selected },
    }))
    if (selected) {
      setLastSelected(selected)
    }
  }, [])

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoBadgeText}>📍 Multi-Platform Autocomplete</Text>
            </View>
            <Text style={styles.title}>React Native Autocomplete</Text>
            <Text style={styles.subtitle}>
              Sleek, touch-friendly dropdown selector for Indonesian locations. Support local search, remote APIs, cascading filters, and styled overrides.
            </Text>
          </View>

          {/* 1. Default Style */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Default Clean</Text>
              <View style={[styles.badge, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                <Text style={[styles.badgeText, { color: '#a5b4fc' }]}>Built-in</Text>
              </View>
            </View>
            <View style={styles.inputSpacing}>
              <IndonesianLocationAutocomplete
                value={themes.default.value}
                onQueryChange={(q) => updateThemeState('default', q, null)}
                onLocationSelect={(loc) => updateThemeState('default', formatLocation(loc), loc)}
                texts={{ placeholder: 'Search village or postcode...' }}
              />
            </View>
            <Text style={styles.styleHint}>
              Neutral color styling that naturally blends into clean modern light-themed applications. Uses the built-in pre-bundled postcode dataset by default.
            </Text>
          </View>

          {/* 2. Slate Dark Mode */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Slate Dark Mode</Text>
              <View style={[styles.badge, { backgroundColor: 'rgba(148, 163, 184, 0.15)' }]}>
                <Text style={[styles.badgeText, { color: '#cbd5e1' }]}>Custom Style</Text>
              </View>
            </View>
            <View style={styles.inputSpacing}>
              <IndonesianLocationAutocomplete
                value={themes.dark.value}
                onQueryChange={(q) => updateThemeState('dark', q, null)}
                onLocationSelect={(loc) => updateThemeState('dark', formatLocation(loc), loc)}
                texts={{ placeholder: 'Search location...' }}
                inputWrapperStyle={styles.darkInputWrapper}
                inputStyle={styles.darkInput}
                dropdownStyle={styles.darkDropdown}
                itemStyle={styles.darkItem}
                itemTextStyle={styles.darkItemText}
                itemSubTextStyle={styles.darkItemSubText}
                emptyStyle={styles.darkDropdown}
                emptyTextStyle={styles.darkItemSubText}
              />
            </View>
            <Text style={styles.styleHint}>
              Override input, lists, borders, and typography styles for premium dark mode aesthetics.
            </Text>
          </View>

          {/* 3. Emerald Mint */}
          <View style={[styles.card, styles.emeraldWrapper]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: '#0f172a' }]}>Emerald Mint</Text>
              <View style={[styles.badge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Text style={[styles.badgeText, { color: '#047857' }]}>Harmony Accent</Text>
              </View>
            </View>
            <View style={styles.inputSpacing}>
              <IndonesianLocationAutocomplete
                value={themes.emerald.value}
                onQueryChange={(q) => updateThemeState('emerald', q, null)}
                onLocationSelect={(loc) => updateThemeState('emerald', formatLocation(loc), loc)}
                texts={{ placeholder: 'Cari desa/kecamatan...' }}
                inputWrapperStyle={styles.emeraldInputWrapper}
                inputStyle={styles.emeraldInput}
                dropdownStyle={styles.emeraldDropdown}
                itemStyle={styles.emeraldItem}
                itemTextStyle={styles.emeraldItemText}
                itemSubTextStyle={styles.emeraldItemSubText}
                emptyStyle={styles.emeraldDropdown}
                emptyTextStyle={styles.emeraldItemSubText}
              />
            </View>
            <Text style={[styles.styleHint, { color: '#64748b' }]}>
              Styled with emerald green borders, custom touchable feedbacks, and matching active rows.
            </Text>
          </View>

          {/* 4. Custom Empty State */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Custom Empty State Layout</Text>
              <View style={[styles.badge, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <Text style={[styles.badgeText, { color: '#fca5a5' }]}>Custom Slot</Text>
              </View>
            </View>
            <View style={styles.inputSpacing}>
              <IndonesianLocationAutocomplete
                value={themes.customEmpty.value}
                onQueryChange={(q) => updateThemeState('customEmpty', q, null)}
                onLocationSelect={(loc) => updateThemeState('customEmpty', formatLocation(loc), loc)}
                texts={{ placeholder: 'Type invalid keywords (e.g. xyz)...' }}
                renderEmptyState={(q) => (
                  <View style={styles.customEmptyContainer}>
                    <Text style={styles.customEmptyTitle}>⚠️ No Locations Match</Text>
                    <Text style={styles.customEmptyText}>
                      We couldn't find any location corresponding to "{q}"
                    </Text>
                  </View>
                )}
              />
            </View>
            <Text style={styles.styleHint}>
              Override the list empty state slot to render custom icons, subtexts, or helper elements.
            </Text>
          </View>

          {/* 5. Chained Province Filter */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Chained Province Filter</Text>
              <View style={[styles.badge, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Text style={[styles.badgeText, { color: '#60a5fa' }]}>Cascading</Text>
              </View>
            </View>
            
            {/* Province Buttons Row */}
            <View style={styles.provinceRow}>
              {PROVINCES.map((prov) => {
                const isActive = selectedProvince === prov
                return (
                  <TouchableOpacity
                    key={prov}
                    style={[
                      styles.provinceButton,
                      isActive && styles.provinceButtonActive,
                    ]}
                    onPress={() => setSelectedProvince(prov)}
                  >
                    <Text
                      style={[
                        styles.provinceButtonText,
                        isActive && styles.provinceButtonTextActive,
                      ]}
                    >
                      {prov}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>

            <View style={styles.inputSpacing}>
              <IndonesianLocationAutocomplete
                value={themes.filtered.value}
                onQueryChange={(q) => updateThemeState('filtered', q, null)}
                onLocationSelect={(loc) => updateThemeState('filtered', formatLocation(loc), loc)}
                texts={{ placeholder: `Search only in ${selectedProvince}...` }}
                searchOptions={{
                  filter: (loc) => loc.province === selectedProvince,
                }}
              />
            </View>
            <Text style={styles.styleHint}>
              Restrict suggestions dynamically to the selected province using a custom filter lambda.
            </Text>
          </View>

          {/* 6. Mock Remote API Search */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Controlled Remote API</Text>
              <View style={[styles.badge, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
                <Text style={[styles.badgeText, { color: '#c084fc' }]}>High Performance</Text>
              </View>
            </View>
            <View style={styles.inputSpacing}>
              <IndonesianLocationAutocomplete
                value={themes.remote.value}
                onQueryChange={(q) => {
                  updateThemeState('remote', q, null)
                  setRemoteQuery(q)
                }}
                onLocationSelect={(loc) => {
                  updateThemeState('remote', formatLocation(loc), loc)
                }}
                searchResults={remoteResults}
                isLoading={remoteLoading}
                texts={{ placeholder: 'Fires network simulation at 3+ chars...' }}
                loaderContent={
                  <View style={styles.customLoader}>
                    <ActivityIndicator size="small" color="#a5b4fc" />
                    <Text style={styles.customLoaderText}>Fetching API...</Text>
                  </View>
                }
              />
            </View>
            <Text style={styles.styleHint}>
              Perfect for low-end mobile hardware. Offloads data loading and searching from the JS thread. You can install `@hudiohizari/indonesian-location-autocomplete-core` directly on your server to handle heavy search logic.
            </Text>
          </View>

          {/* Metadata Detail Preview */}
          <View style={styles.detailsCard}>
            {lastSelected ? (
              <View>
                <View style={styles.detailsHeader}>
                  <Text style={styles.detailsTitle}>📍 Selected Location Details</Text>
                </View>
                
                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Postcode</Text>
                    <Text style={styles.detailValue}>{lastSelected.code}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Village / Kelurahan</Text>
                    <Text style={styles.detailValue}>{lastSelected.village}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>District / Kecamatan</Text>
                    <Text style={styles.detailValue}>{lastSelected.district}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Regency / Kota / Kab</Text>
                    <Text style={styles.detailValue}>{lastSelected.regency}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Province / Provinsi</Text>
                    <Text style={styles.detailValue}>{lastSelected.province}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Elevation / Coordinates</Text>
                    <Text style={styles.detailValue}>
                      {lastSelected.elevation}m ({lastSelected.latitude}, {lastSelected.longitude})
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.noSelection}>
                <Text style={styles.noSelectionTitle}>ℹ️ No Selection Made</Text>
                <Text style={styles.noSelectionText}>
                  Select a location suggestion from any input card above to inspect complete record details.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#070a13',
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#070a13',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 10,
  },
  logoBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    borderRadius: 100,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  logoBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a5b4fc',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320,
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  badge: {
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  inputSpacing: {
    marginVertical: 4,
  },
  styleHint: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 10,
    lineHeight: 14,
  },
  
  // Custom Dark Mode styling
  darkInputWrapper: {
    backgroundColor: '#1e293b',
    borderColor: '#475569',
  },
  darkInput: {
    color: '#f8fafc',
  },
  darkDropdown: {
    backgroundColor: '#1e293b',
    borderColor: '#475569',
  },
  darkItem: {
    borderBottomColor: '#334155',
  },
  darkItemText: {
    color: '#f8fafc',
  },
  darkItemSubText: {
    color: '#94a3b8',
  },

  // Custom Emerald Mint styling
  emeraldWrapper: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  emeraldInputWrapper: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderWidth: 2,
    borderRadius: 12,
  },
  emeraldInput: {
    color: '#0f172a',
  },
  emeraldDropdown: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 12,
    borderWidth: 2,
  },
  emeraldItem: {
    borderBottomColor: '#ecfdf5',
  },
  emeraldItemText: {
    color: '#047857',
  },
  emeraldItemSubText: {
    color: '#64748b',
  },

  // Custom Empty state styling
  customEmptyContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customEmptyTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 2,
  },
  customEmptyText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
  },

  // Chained Province select layout
  provinceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  provinceButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
  },
  provinceButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  provinceButtonText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  provinceButtonTextActive: {
    color: '#ffffff',
  },

  // Remote custom loading
  customLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customLoaderText: {
    fontSize: 10,
    color: '#a5b4fc',
  },

  // Details styling
  detailsCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.15)',
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
  },
  detailsHeader: {
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
  },
  detailsGrid: {
    gap: 12,
  },
  detailItem: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  detailLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    color: '#e2e8f0',
    fontWeight: '500',
  },
  noSelection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noSelectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  noSelectionText: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 14,
    maxWidth: 240,
  },
})
