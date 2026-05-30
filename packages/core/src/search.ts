import type { LocationRecord, SearchOptions } from './types'

const DEFAULT_MAX_RESULTS = 10
const DEFAULT_MIN_QUERY_LENGTH = 3

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
    const village = (item.village || '').toLowerCase()
    const district = (item.district || '').toLowerCase()
    const regency = (item.regency || '').toLowerCase()
    const province = (item.province || '').toLowerCase()
    const code = String(item.code || '')

    const matches = searchTerms.every(
      term =>
        village.includes(term) ||
        district.includes(term) ||
        regency.includes(term) ||
        province.includes(term) ||
        code.includes(term)
    )

    if (matches) {
      results.push(item)
    }
  }

  return results
}
