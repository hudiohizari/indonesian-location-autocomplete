/**
 * A single record from the Indonesian postcode database.
 * Each record represents a village (kelurahan) within the
 * administrative hierarchy: Province → Regency → District → Village.
 */
export interface LocationRecord {
  /** Postcode number */
  code: number
  /** Village / Kelurahan name */
  village: string
  /** District / Kecamatan name */
  district: string
  /** Regency / Kota or Kabupaten name */
  regency: string
  /** Province / Provinsi name */
  province: string
  /** Latitude coordinate */
  latitude: number
  /** Longitude coordinate */
  longitude: number
  /** Elevation in meters */
  elevation: number
  /** Indonesian timezone code (WIB, WITA, WIT) */
  timezone: string
}

/**
 * Options for the search function.
 */
export interface SearchOptions {
  /** Maximum number of results to return. Default: 10 */
  maxResults?: number
  /** Minimum query length before searching. Default: 3 */
  minQueryLength?: number
}
