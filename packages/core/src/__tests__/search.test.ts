/*
 * Created by Hudio Hizari
 * https://hizari.my.id/
 * https://github.com/hudiohizari/
 * hhizari@gmail.com
 */

import { describe, it, expect } from 'vitest'
import { searchLocations } from '../search'
import type { LocationRecord } from '../types'

const mockData: LocationRecord[] = [
  {
    code: 10110,
    village: 'Gambir',
    district: 'Gambir',
    regency: 'Jakarta Pusat',
    province: 'DKI Jakarta',
    latitude: -6.1764,
    longitude: 106.8272,
    elevation: 8,
    timezone: 'WIB'
  },
  {
    code: 10310,
    village: 'Menteng',
    district: 'Menteng',
    regency: 'Jakarta Pusat',
    province: 'DKI Jakarta',
    latitude: -6.1951,
    longitude: 106.8324,
    elevation: 12,
    timezone: 'WIB'
  },
  {
    code: 40132,
    village: 'Dago',
    district: 'Coblong',
    regency: 'Bandung',
    province: 'Jawa Barat',
    latitude: -6.8808,
    longitude: 107.6191,
    elevation: 750,
    timezone: 'WIB'
  }
]

describe('searchLocations', () => {
  it('should return empty array for empty or short queries by default', () => {
    expect(searchLocations('', mockData)).toEqual([])
    expect(searchLocations('  ', mockData)).toEqual([])
    expect(searchLocations('da', mockData)).toEqual([]) // default min length is 3
  })

  it('should match locations by village name (case-insensitive)', () => {
    const results = searchLocations('dago', mockData)
    expect(results).toHaveLength(1)
    expect(results[0].village).toBe('Dago')

    const uppercaseResults = searchLocations('DAGO', mockData)
    expect(uppercaseResults).toHaveLength(1)
  })

  it('should match locations by postcode', () => {
    const results = searchLocations('40132', mockData)
    expect(results).toHaveLength(1)
    expect(results[0].code).toBe(40132)
  })

  it('should support multi-term matching (AND logic across fields)', () => {
    // Both terms 'menteng' and 'jakarta' should match a single record
    const results = searchLocations('menteng jakarta', mockData)
    expect(results).toHaveLength(1)
    expect(results[0].village).toBe('Menteng')

    // 'dago jakarta' should return nothing because dago is in Bandung/Jawa Barat
    const noResults = searchLocations('dago jakarta', mockData)
    expect(noResults).toHaveLength(0)
  })

  it('should normalize punctuation (commas, dashes, periods)', () => {
    // "jakarta, pusat" should match "Jakarta Pusat" after normalizing comma to space
    const results = searchLocations('jakarta, pusat', mockData)
    expect(results).toHaveLength(2) // Gambir and Menteng are both in Jakarta Pusat

    // "dago-coblong" should match "Dago" in "Coblong" after normalizing dash
    const dashResults = searchLocations('dago-coblong', mockData)
    expect(dashResults).toHaveLength(1)
    expect(dashResults[0].village).toBe('Dago')
  })

  it('should respect maxResults option', () => {
    const results = searchLocations('jakarta', mockData, { maxResults: 1 })
    expect(results).toHaveLength(1)
  })

  it('should respect custom minQueryLength option', () => {
    // Custom minQueryLength of 2 allows searching for 'da'
    const results = searchLocations('da', mockData, { minQueryLength: 2 })
    expect(results).toHaveLength(1)
    expect(results[0].village).toBe('Dago')
  })
})
