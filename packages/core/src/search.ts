/*
 * Created by Hudio Hizari
 * https://hizari.my.id/
 * https://github.com/hudiohizari/
 * hhizari@gmail.com
 */

import type { LocationRecord, SearchOptions } from './types'

const DEFAULT_MAX_RESULTS = 10
const DEFAULT_MIN_QUERY_LENGTH = 3

/**
 * Module-scoped cache for normalized search strings.
 * Uses WeakMap to avoid mutating input data objects and to allow GC
 * when the data array is released by the consumer.
 */
const searchStrCache = new WeakMap<LocationRecord, string>()

/**
 * Searches the Indonesian postcode database locally.
 *
 * Splits the query into individual terms and returns records where
 * every term matches at least one field (village, district, regency,
 * province, or postcode). This supports natural queries like
 * "Menteng Jakarta" or "40132".
 *
 * @param query - The user's search input
 * @param data - The full postcode dataset (array of LocationRecord)
 * @param options - Optional search configuration
 * @returns Filtered array of matching LocationRecord items
 */
export function searchLocations(
  query: string,
  data: LocationRecord[],
  options?: SearchOptions
): LocationRecord[] {
  const maxResults = options?.maxResults ?? DEFAULT_MAX_RESULTS
  const minQueryLength = options?.minQueryLength ?? DEFAULT_MIN_QUERY_LENGTH

  if (!query || query.trim().length < minQueryLength) {
    return []
  }

  const normalized = query.toLowerCase().replace(/[,.\-]/g, ' ').trim()
  const searchTerms = normalized.split(/\s+/).filter(Boolean)

  if (searchTerms.length === 0) {
    return []
  }

  const results: LocationRecord[] = []

  for (let i = 0; i < data.length; i++) {
    if (results.length >= maxResults) break

    const item = data[i]

    // Lazily cache the normalized search string per record.
    // Separator '\n' ensures search terms cannot cross field boundaries.
    let searchStr = searchStrCache.get(item)
    if (searchStr === undefined) {
      searchStr = `${item.village || ''}\n${item.district || ''}\n${item.regency || ''}\n${item.province || ''}\n${item.code || ''}`.toLowerCase()
      searchStrCache.set(item, searchStr)
    }

    const matches = searchTerms.every(term => searchStr!.includes(term))

    if (matches) {
      if (!options?.filter || options.filter(item)) {
        results.push(item)
      }
    }
  }

  return results
}
