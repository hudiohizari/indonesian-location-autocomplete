/*
 * Created by Hudio Hizari
 * https://hizari.my.id/
 * https://github.com/hudiohizari/
 * hhizari@gmail.com
 */

import { useState, useEffect } from 'react'
import { IndonesianLocationAutocomplete } from '@indonesian-location-autocomplete/react'
import type { LocationRecord } from '@indonesian-location-autocomplete/react'
import postcodeDataRaw from '@indonesian-location-autocomplete/core/data'

const postcodeData = postcodeDataRaw as unknown as LocationRecord[]

interface PreviewState {
  value: string
  selected: LocationRecord | null
}

function App() {
  const [themes, setThemes] = useState<Record<string, PreviewState>>({
    default: { value: '', selected: null },
    dark: { value: '', selected: null },
    emerald: { value: '', selected: null },
    minimal: { value: '', selected: null },
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
        .filter(item => {
          const content = `${item.village} ${item.district} ${item.regency} ${item.province} ${item.code}`.toLowerCase()
          return content.includes(queryLower)
        })
        .slice(0, 5)

      setRemoteResults(matches)
      setRemoteLoading(false)
    }, 600) // Simulated network latency

    return () => clearTimeout(handler)
  }, [remoteQuery])

  const formatLocation = (loc: LocationRecord) => {
    return `${loc.village}, ${loc.district}, ${loc.regency}, ${loc.province} - ${loc.code}`
  }

  // Track the most recently selected location across all preview cards
  const [lastSelected, setLastSelected] = useState<LocationRecord | null>(null)

  const updateThemeState = (key: string, value: string, selected: LocationRecord | null) => {
    setThemes(prev => ({
      ...prev,
      [key]: { value, selected }
    }))
    if (selected) setLastSelected(selected)
  }

  return (
    <div className="playground-wrapper">
      <style>{`
        .playground-wrapper {
          min-height: 100vh;
          background: radial-gradient(circle at top left, #0d1527, #070a13);
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #f1f5f9;
          padding: 48px 24px;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        header {
          text-align: center;
          margin-bottom: 48px;
        }

        .logo-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15));
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 100px;
          padding: 6px 16px;
          font-size: 0.8125rem;
          font-weight: 600;
          color: #a5b4fc;
          margin-bottom: 16px;
        }

        h1 {
          font-size: 2.25rem;
          font-weight: 800;
          background: linear-gradient(135deg, #ffffff 30%, #a5b4fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0 0 12px 0;
          letter-spacing: -0.025em;
        }

        .subtitle {
          color: #94a3b8;
          font-size: 1rem;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* Preview Grid */
        .preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }

        .preview-card {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          backdrop-filter: blur(12px);
          transition: transform 0.2s ease, border-color 0.2s ease;
          position: relative;
          z-index: 1;
        }

        .preview-card:hover,
        .preview-card:focus-within {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.12);
          z-index: 10;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .card-title {
          font-weight: 700;
          font-size: 0.9375rem;
          color: #f1f5f9;
        }

        .card-tag {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 6px;
        }

        /* Target theme CSS overrides using custom classes */

        /* 1. Slate Dark Mode */
        .theme-dark {
          --ila-input-bg: #1e293b;
          --ila-input-text-color: #f8fafc;
          --ila-input-border: 1px solid #475569;
          --ila-placeholder-color: #64748b;
          --ila-focus-border-color: #818cf8;
          --ila-focus-shadow: 0 0 0 3px rgba(129, 140, 248, 0.25);
          --ila-dropdown-bg: #1e293b;
          --ila-dropdown-border: 1px solid #475569;
          --ila-dropdown-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
          --ila-item-hover-bg: #334155;
          --ila-item-primary-color: #f8fafc;
          --ila-item-secondary-color: #94a3b8;
          --ila-icon-color: #64748b;
          --ila-item-icon-color: #64748b;
        }

        /* 2. Emerald Forest (Light Theme styling inside Dark card wrapper) */
        .theme-emerald-wrapper {
          background: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
        }
        .theme-emerald-wrapper .card-title {
          color: #0f172a;
        }
        .theme-emerald {
          --ila-input-bg: #ffffff;
          --ila-input-text-color: #0f172a;
          --ila-input-border: 2px solid #cbd5e1;
          --ila-input-border-radius: 12px;
          --ila-focus-border-color: #10b981;
          --ila-focus-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
          --ila-dropdown-bg: #ffffff;
          --ila-dropdown-border: 2px solid #e2e8f0;
          --ila-dropdown-border-radius: 12px;
          --ila-item-hover-bg: #ecfdf5;
          --ila-item-primary-color: #047857;
          --ila-item-secondary-color: #64748b;
          --ila-icon-color: #10b981;
          --ila-item-icon-color: #10b981;
        }

        /* 3. Minimal Gold */
        .theme-minimal {
          --ila-input-bg: transparent;
          --ila-input-text-color: #f8fafc;
          --ila-input-border: none;
          --ila-input-border-radius: 0px;
          --ila-input-padding: 10px 10px 10px 30px;
          --ila-focus-border-color: #f59e0b;
          --ila-focus-shadow: none;
          --ila-dropdown-bg: #0f172a;
          --ila-dropdown-border: 1px solid #334155;
          --ila-item-hover-bg: #1e293b;
          --ila-item-primary-color: #fbbf24;
          --ila-item-secondary-color: #94a3b8;
          --ila-icon-color: #f59e0b;
          --ila-item-icon-color: #f59e0b;
        }
        .theme-minimal input {
          border-bottom: 2px solid #334155 !important;
          border-radius: 0 !important;
          padding-left: 32px !important;
        }
        .theme-minimal input:focus {
          border-bottom-color: #f59e0b !important;
        }
        .theme-minimal svg {
          left: 4px !important;
        }

        .filter-select {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: #1e293b;
          color: #f1f5f9;
          font-family: inherit;
          margin-bottom: 16px;
          outline: none;
          cursor: pointer;
        }

        /* Details section */
        .details-section {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%);
          border: 1px solid rgba(99, 102, 241, 0.15);
          border-radius: 20px;
          padding: 32px;
          backdrop-filter: blur(16px);
          max-width: 720px;
          margin: 0 auto;
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.3);
          position: relative;
          z-index: 0;
        }

        .details-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .details-icon-wrapper {
          background: rgba(99, 102, 241, 0.2);
          border-radius: 10px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #a5b4fc;
        }

        .details-title {
          font-weight: 700;
          font-size: 1.125rem;
          color: #f8fafc;
          margin: 0;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .detail-item {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 14px 18px;
        }

        .detail-label {
          font-size: 0.75rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
          font-weight: 600;
        }

        .detail-value {
          font-size: 0.9375rem;
          color: #e2e8f0;
          font-weight: 500;
        }

        .no-selection {
          text-align: center;
          padding: 40px 0;
          color: #475569;
          font-weight: 500;
        }

        .style-hint {
          font-size: 0.75rem;
          color: #64748b;
          margin-top: auto;
          padding-top: 16px;
          line-height: 1.4;
        }
      `}</style>

      <div className="container">
        <header>
          <div className="logo-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Multi-Platform UI Autocomplete
          </div>
          <h1>Indonesian Location Autocomplete</h1>
          <p className="subtitle">
            A premium, high performance location search component. Test multiple style presets, empty states, parent filtering constraints, and API remote search controls.
          </p>
        </header>

        <div className="preview-grid">
          {/* 1. Default Style */}
          <div className="preview-card">
            <div className="card-header">
              <span className="card-title">Default Clean</span>
              <span className="card-tag" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc' }}>Built-in</span>
            </div>
            <div style={{ marginBottom: 24 }}>
              <IndonesianLocationAutocomplete
                value={themes.default.value}
                onQueryChange={(q) => updateThemeState('default', q, null)}
                onLocationSelect={(loc) => updateThemeState('default', formatLocation(loc), loc)}
                texts={{ placeholder: 'Cari lokasi...' }}
              />
            </div>
            <p className="style-hint">
              Neutral color styling that naturally blends into clean modern light-themed applications. Uses the built-in pre-bundled postcode dataset by default.
            </p>
          </div>

          {/* 2. Slate Dark Mode */}
          <div className="preview-card">
            <div className="card-header">
              <span className="card-title">Slate Dark</span>
              <span className="card-tag" style={{ background: 'rgba(148, 163, 184, 0.15)', color: '#cbd5e1' }}>CSS Override</span>
            </div>
            <div style={{ marginBottom: 24 }}>
              <IndonesianLocationAutocomplete
                containerClassName="theme-dark"
                value={themes.dark.value}
                onQueryChange={(q) => updateThemeState('dark', q, null)}
                onLocationSelect={(loc) => updateThemeState('dark', formatLocation(loc), loc)}
                texts={{ placeholder: 'Cari lokasi...' }}
              />
            </div>
            <p className="style-hint">
              Applied custom dark values using CSS variables. Perfect for integrations with dark UI themes.
            </p>
          </div>

          {/* 3. Emerald Forest */}
          <div className="preview-card theme-emerald-wrapper">
            <div className="card-header">
              <span className="card-title">Emerald Mint</span>
              <span className="card-tag" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#047857' }}>Card theme</span>
            </div>
            <div style={{ marginBottom: 24 }}>
              <IndonesianLocationAutocomplete
                containerClassName="theme-emerald"
                value={themes.emerald.value}
                onQueryChange={(q) => updateThemeState('emerald', q, null)}
                onLocationSelect={(loc) => updateThemeState('emerald', formatLocation(loc), loc)}
                texts={{ placeholder: 'Cari lokasi...' }}
              />
            </div>
            <p className="style-hint" style={{ color: '#64748b' }}>
              Styled with green border accents, rounded borders, and custom background highlights.
            </p>
          </div>

          {/* 4. Minimal Gold */}
          <div className="preview-card">
            <div className="card-header">
              <span className="card-title">Minimal Gold</span>
              <span className="card-tag" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fcd34d' }}>Borderless</span>
            </div>
            <div style={{ marginBottom: 24 }}>
              <IndonesianLocationAutocomplete
                containerClassName="theme-minimal"
                value={themes.minimal.value}
                onQueryChange={(q) => updateThemeState('minimal', q, null)}
                onLocationSelect={(loc) => updateThemeState('minimal', formatLocation(loc), loc)}
                texts={{ placeholder: 'Cari lokasi...' }}
              />
            </div>
            <p className="style-hint">
              Border-free input with only a bottom underline, matching compact dashboard search modules.
            </p>
          </div>

          {/* 5. Custom Empty State */}
          <div className="preview-card">
            <div className="card-header">
              <span className="card-title">Custom Empty State</span>
              <span className="card-tag" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5' }}>Custom JSX</span>
            </div>
            <div style={{ marginBottom: 24 }}>
              <IndonesianLocationAutocomplete
                value={themes.customEmpty.value}
                onQueryChange={(q) => updateThemeState('customEmpty', q, null)}
                onLocationSelect={(loc) => updateThemeState('customEmpty', formatLocation(loc), loc)}
                texts={{ placeholder: 'Type invalid name (e.g. xyz)...' }}
                renderEmptyState={(q) => (
                  <div style={{ padding: '16px', textAlign: 'center' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px', display: 'inline-block' }}>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.875rem' }}>No Matches Found</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '2px' }}>
                      We couldn't find any location matching "{q}"
                    </div>
                  </div>
                )}
              />
            </div>
            <p className="style-hint">
              Customize the empty state markup (render custom icons, warnings, or buttons) using the query parameter.
            </p>
          </div>

          {/* 6. Dynamic Parent Filter */}
          <div className="preview-card">
            <div className="card-header">
              <span className="card-title">Chained Province Filter</span>
              <span className="card-tag" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>Cascading</span>
            </div>
            <select
              className="filter-select"
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
            >
              <option value="Jawa Barat">Only Jawa Barat</option>
              <option value="DKI Jakarta">Only DKI Jakarta</option>
              <option value="Jawa Tengah">Only Jawa Tengah</option>
              <option value="Banten">Only Banten</option>
            </select>
            <div style={{ marginBottom: 24 }}>
              <IndonesianLocationAutocomplete
                value={themes.filtered.value}
                onQueryChange={(q) => updateThemeState('filtered', q, null)}
                onLocationSelect={(loc) => updateThemeState('filtered', formatLocation(loc), loc)}
                texts={{ placeholder: `Search within ${selectedProvince}...` }}
                searchOptions={{
                  filter: (loc) => loc.province === selectedProvince
                }}
              />
            </div>
            <p className="style-hint">
              Filters locations dynamically based on parent selects (e.g. searching only cities within a selected province).
            </p>
          </div>

          {/* 7. Mock Controlled API Search */}
          <div className="preview-card">
            <div className="card-header">
              <span className="card-title">Controlled Remote API</span>
              <span className="card-tag" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>Controlled API</span>
            </div>
            <div style={{ marginBottom: 24 }}>
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
                texts={{ placeholder: 'Search via Mock API...' }}
                loaderContent={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a5b4fc', fontSize: '0.75rem' }}>
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      border: '2px solid #a5b4fc',
                      borderTopColor: 'transparent',
                      animation: 'ila-spin 0.6s linear infinite'
                    }} />
                    <span>API Fetching...</span>
                  </div>
                }
              />
            </div>
            <p className="style-hint">
              Bypasses the 15MB local JSON database entirely. Fires query callback and renders controlled results/loader state directly. You can install `@indonesian-location-autocomplete/core` directly on your server to handle heavy search logic.
            </p>
          </div>
        </div>

        {/* Selected Location Details */}
        <div className="details-section">
          {lastSelected ? (
            <div>
              <div className="details-header">
                <div className="details-icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <h3 className="details-title">Selected Location Details</h3>
              </div>
              <div className="details-grid">
                <div className="detail-item">
                  <div className="detail-label">Postcode</div>
                  <div className="detail-value">{lastSelected.code}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Village / Kelurahan</div>
                  <div className="detail-value">{lastSelected.village}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">District / Kecamatan</div>
                  <div className="detail-value">{lastSelected.district}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Regency / Kota / Kabupaten</div>
                  <div className="detail-value">{lastSelected.regency}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Province / Provinsi</div>
                  <div className="detail-value">{lastSelected.province}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Coordinates</div>
                  <div className="detail-value">{lastSelected.latitude}, {lastSelected.longitude}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Timezone</div>
                  <div className="detail-value">{lastSelected.timezone}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Elevation</div>
                  <div className="detail-value">{lastSelected.elevation}m</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12, opacity: 0.5 }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <div>Select a location from any of the inputs above to view full metadata details here.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
