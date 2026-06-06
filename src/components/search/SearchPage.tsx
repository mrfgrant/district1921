'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { BusinessMap } from '@/components/map/BusinessMap'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CATEGORY_LABELS, BusinessCategory } from '@/types'

const CATEGORY_ICONS: Record<string, string> = {
  'food-dining': '🍽',
  'beauty-wellness': '💇',
  'health-medical': '🩺',
  'legal-financial': '⚖️',
  'home-construction': '🏗',
  'automotive': '🚗',
  'professional-services': '💼',
  'education-childcare': '📚',
  'retail-products': '🛒',
  'faith-community': '⛪',
  'real-estate': '🏠',
  'entertainment-travel': '🎭',
}

interface Business {
  id: string
  name: string
  slug: string
  category: string
  city: string
  state: string
  address: string | null
  is_mobile_service: boolean
  logo_url: string | null
  description: string | null
  hours: any
  gold_shield: boolean
  subscription_status: string
  rating_avg: number | null
  rating_count: number
  checkin_count: number
}

function isOpen(hours: any) {
  if (!hours) return null
  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
  const today = days[new Date().getDay()]
  const h = hours[today]
  if (!h || h.closed) return false
  const now = new Date()
  const cur = now.getHours() * 60 + now.getMinutes()
  const [oh,om] = h.open.split(':').map(Number)
  const [ch,cm] = h.close.split(':').map(Number)
  return cur >= oh*60+om && cur < ch*60+cm
}

function BusinessCard({ biz }: { biz: Business }) {
  const openStatus = isOpen(biz.hours)
  const isPro = biz.subscription_status === 'active'

  return (
    <Link href={`/business/${biz.slug}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: '#fff',
        border: `1px solid ${isPro && biz.gold_shield ? '#c9a84c' : '#e5e0d5'}`,
        borderRadius: 12,
        padding: 16,
        display: 'grid',
        gridTemplateColumns: '52px 1fr',
        gap: 14,
        cursor: 'pointer',
        transition: 'box-shadow 0.15s, border-color 0.15s',
        position: 'relative',
        marginBottom: 10,
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLDivElement).style.borderColor = '#2d6a4f' }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; (e.currentTarget as HTMLDivElement).style.borderColor = isPro && biz.gold_shield ? '#c9a84c' : '#e5e0d5' }}
      >
        {/* Pro badge */}
        {isPro && (
          <div style={{
            position: 'absolute', top: -1, right: 16,
            background: '#c9a84c', color: '#1a3a2a',
            fontSize: 9, fontWeight: 800, padding: '2px 8px',
            borderRadius: '0 0 6px 6px', letterSpacing: '0.05em',
          }}>
            {biz.gold_shield ? '🛡 GOLD SHIELD' : '★ PRO'}
          </div>
        )}

        {/* Logo */}
        <div style={{
          width: 52, height: 52, borderRadius: 10, flexShrink: 0,
          background: biz.logo_url ? `url(${biz.logo_url}) center/cover` : '#d8f3dc',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontWeight: 700, color: '#2d6a4f',
          fontFamily: "'Playfair Display', serif",
        }}>
          {!biz.logo_url && biz.name[0]}
        </div>

        {/* Info */}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1c1c1c', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {biz.name}
          </div>
          <div style={{ fontSize: 11, color: '#2d6a4f', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
            {CATEGORY_ICONS[biz.category]} {CATEGORY_LABELS[biz.category as BusinessCategory] ?? biz.category}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6b7280', flexWrap: 'wrap' }}>
            {biz.rating_avg && biz.rating_count > 0 && (
              <span style={{ color: '#c9a84c', fontWeight: 600 }}>★ {Number(biz.rating_avg).toFixed(1)}</span>
            )}
            <span>{biz.city}, {biz.state}</span>
            {biz.is_mobile_service && <span style={{ background: '#e8f0fe', color: '#3c4ec4', padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>📱 Mobile</span>}
            {(biz as any).service_area === 'nationwide' && <span style={{ background: '#f0f4ff', color: '#3730a3', padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>🇺🇸 Nationwide</span>}
            {(biz as any).service_area === 'online' && <span style={{ background: '#f0fdf4', color: '#166534', padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>💻 Online</span>}
            {(biz as any).service_area === 'statewide' && <span style={{ background: '#fafaf0', color: '#713f12', padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>🗺 Statewide</span>}
            {openStatus !== null && (
              <span style={{
                background: openStatus ? '#e8f5e9' : '#fdecea',
                color: openStatus ? '#2e7d32' : '#c62828',
                padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600,
              }}>
                {openStatus ? 'Open' : 'Closed'}
              </span>
            )}
          </div>
          {biz.description && (
            <div style={{ fontSize: 12, color: '#8a8070', marginTop: 6, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {biz.description}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [q, setQ] = useState(searchParams.get('q') ?? '')
  const [city, setCity] = useState(searchParams.get('city') ?? '')
  const [state, setState] = useState(searchParams.get('state') ?? '')
  const [category, setCategory] = useState(searchParams.get('category') ?? '')
  const [shield, setShield] = useState(searchParams.get('shield') === 'true')
  const [openNow, setOpenNow] = useState(searchParams.get('open') === 'true')
  const [mobile, setMobile] = useState(searchParams.get('mobile') === 'true')
  const [nationwide, setNationwide] = useState(searchParams.get('nationwide') === 'true')

  const [results, setResults] = useState<Business[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [view, setView] = useState<'list'|'map'>('map')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; city: string; state: string } | null>(null)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number; city?: string; state?: string } | undefined>(undefined)
  const [locating, setLocating] = useState(false)

  const abortRef = useRef<AbortController | null>(null)

  const doSearch = useCallback(async (params: {
    q: string; city: string; state: string; category: string
    shield: boolean; openNow: boolean; mobile: boolean; nationwide?: boolean
  }) => {
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    setLoading(true)
    setSearched(true)

    const sp = new URLSearchParams()
    if (params.q) sp.set('q', params.q)
    if (params.city) sp.set('city', params.city)
    if (params.state) sp.set('state', params.state)
    if (params.category) sp.set('category', params.category)
    if (params.shield) sp.set('shield', 'true')
    if (params.openNow) sp.set('open', 'true')
    if (params.mobile) sp.set('mobile', 'true')
    if (params.nationwide) sp.set('nationwide', 'true')

    try {
      const res = await fetch(`/api/search?${sp}`, { signal: abortRef.current.signal, cache: 'no-store' })
      const data = await res.json()
      setResults(data.results ?? [])
      setCount(data.count ?? 0)

      // Update map center to reflect the searched location
      const STATE_CENTERS: Record<string, { lat: number; lng: number }> = {
        AL:{lat:32.8,lng:-86.8},AK:{lat:64.2,lng:-153.4},AZ:{lat:34.2,lng:-111.1},AR:{lat:34.8,lng:-92.2},
        CA:{lat:36.7,lng:-119.4},CO:{lat:39.0,lng:-105.5},CT:{lat:41.6,lng:-72.7},DE:{lat:39.0,lng:-75.5},
        FL:{lat:27.8,lng:-81.6},GA:{lat:32.9,lng:-83.4},HI:{lat:20.8,lng:-156.3},ID:{lat:44.1,lng:-114.7},
        IL:{lat:40.6,lng:-89.2},IN:{lat:40.3,lng:-86.1},IA:{lat:42.0,lng:-93.6},KS:{lat:38.5,lng:-98.4},
        KY:{lat:37.5,lng:-85.3},LA:{lat:31.2,lng:-92.0},ME:{lat:45.4,lng:-69.0},MD:{lat:39.0,lng:-76.8},
        MA:{lat:42.4,lng:-71.8},MI:{lat:44.3,lng:-85.4},MN:{lat:46.4,lng:-93.1},MS:{lat:32.7,lng:-89.7},
        MO:{lat:38.4,lng:-92.5},MT:{lat:46.9,lng:-110.4},NE:{lat:41.5,lng:-99.9},NV:{lat:38.8,lng:-116.4},
        NH:{lat:44.0,lng:-71.6},NJ:{lat:40.1,lng:-74.5},NM:{lat:34.5,lng:-106.2},NY:{lat:42.9,lng:-75.5},
        NC:{lat:35.5,lng:-79.4},ND:{lat:47.5,lng:-100.5},OH:{lat:40.4,lng:-82.8},OK:{lat:35.6,lng:-96.9},
        OR:{lat:44.6,lng:-122.1},PA:{lat:41.2,lng:-77.2},RI:{lat:41.7,lng:-71.5},SC:{lat:33.8,lng:-80.9},
        SD:{lat:44.4,lng:-100.2},TN:{lat:35.9,lng:-86.4},TX:{lat:31.0,lng:-99.9},UT:{lat:39.3,lng:-111.1},
        VT:{lat:44.0,lng:-72.7},VA:{lat:37.4,lng:-79.0},WA:{lat:47.4,lng:-120.5},WV:{lat:38.6,lng:-80.5},
        WI:{lat:44.8,lng:-89.8},WY:{lat:43.1,lng:-107.6},DC:{lat:38.9,lng:-77.0},
      }

      const searchedCity = params.city?.trim() ?? ''
      const searchedState = (params.state?.trim() ?? '').toUpperCase()

      if (searchedCity || searchedState) {
        const withCoords = (data.results ?? []).find((r: any) => r.lat && r.lng)
        if (withCoords && searchedCity) {
          setMapCenter({ lat: withCoords.lat, lng: withCoords.lng, city: searchedCity, state: searchedState })
        } else if (searchedState && STATE_CENTERS[searchedState]) {
          setMapCenter({ ...STATE_CENTERS[searchedState], state: searchedState, city: '' })
        }
      }

      // Update URL
      router.replace(`/search?${sp}`, { scroll: false })
    } catch (e: any) {
      if (e.name !== 'AbortError') console.error(e)
    } finally {
      setLoading(false)
    }
  }, [router])

  // On first load: detect location, load all businesses in state for map
  useEffect(() => {
    if (searchParams.toString()) {
      doSearch({ q, city, state, category, shield, openNow, mobile, nationwide })
      return
    }

    // Load default state view (Georgia fallback if no geolocation)
    async function loadDefaultView() {
      setLocating(true)
      let detectedLat = 32.9, detectedLng = -83.4 // Georgia center fallback
      let detectedCity = '', detectedState = 'GA'

      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 6000 })
          )
          detectedLat = pos.coords.latitude
          detectedLng = pos.coords.longitude

          // Reverse geocode
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${detectedLat},${detectedLng}&result_type=locality&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
          )
          const data = await res.json()
          if (data.results?.[0]) {
            for (const c of data.results[0].address_components) {
              if (c.types.includes('locality')) detectedCity = c.long_name
              if (c.types.includes('administrative_area_level_1')) detectedState = c.short_name
            }
          }
        } catch {
          // Geolocation denied or failed — use fallback
        }
      }

      setUserLocation({ lat: detectedLat, lng: detectedLng, city: detectedCity, state: detectedState })
      setLocating(false)

      // Load ALL businesses in the detected state for the default map view
      // Don't filter by city — show the whole state
      doSearch({ q: '', city: '', state: detectedState, category, shield, openNow, mobile, nationwide })
    }

    loadDefaultView()
  }, []) // eslint-disable-line

  // Run search on mount if params exist
  useEffect(() => {
    if (searchParams.toString()) {
      doSearch({ q, city, state, category, shield, openNow, mobile })
    }
  }, []) // eslint-disable-line

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    doSearch({ q, city, state, category, shield, openNow, mobile, nationwide })
  }

  function toggleFilter(key: 'shield' | 'openNow' | 'mobile' | 'nationwide') {
    const next = { shield, openNow, mobile, nationwide, [key]: key === 'shield' ? !shield : key === 'openNow' ? !openNow : key === 'mobile' ? !mobile : !nationwide }
    if (key === 'shield') setShield(!shield)
    if (key === 'openNow') setOpenNow(!openNow)
    if (key === 'mobile') setMobile(!mobile)
    if (key === 'nationwide') setNationwide(!nationwide)
    if (searched) doSearch({ q, city, state, category, ...next })
  }

  function selectCategory(cat: string) {
    const next = category === cat ? '' : cat
    setCategory(next)
    if (searched) doSearch({ q, city, state, category: next, shield, openNow, mobile })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf7f0', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      {/* Search hero */}
      <div style={{ background: 'linear-gradient(135deg, #1a3a2a 0%, #2d6a4f 60%, #1a4a35 100%)', padding: '36px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#c9a84c', marginBottom: 12 }}>
            District 1921 · Community Business Directory
          </p>
          {locating && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
              <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>◌</span>
              Detecting your location…
            </div>
          )}
          <form onSubmit={handleSearch}>
            <div style={{ display: 'flex', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', marginBottom: 16 }}>
              <div style={{ flex: 2, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8, borderRight: '1px solid #e5e0d5' }}>
                <span style={{ fontSize: 16, color: '#b0a898' }}>🔍</span>
                <input
                  type="text"
                  placeholder="Business name, category, or keyword..."
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: '#1c1c1c', padding: '16px 0', background: 'transparent' }}
                />
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8, borderRight: '1px solid #e5e0d5', minWidth: 0 }}>
                <span style={{ fontSize: 14, color: '#b0a898' }}>📍</span>
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: '#1c1c1c', padding: '16px 0', background: 'transparent', minWidth: 0 }}
                />
              </div>
              <select
                value={state}
                onChange={e => setState(e.target.value)}
                style={{ padding: '0 12px', border: 'none', borderRight: '1px solid #e5e0d5', outline: 'none', fontSize: 13, color: state ? '#1c1c1c' : '#b0a898', background: 'transparent', cursor: 'pointer' }}
              >
                <option value="">State</option>
                {['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button type="submit"
                style={{ padding: '0 28px', background: '#c9a84c', border: 'none', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: '#1a3a2a', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Search
              </button>
            </div>
          </form>

          {/* Category pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(Object.entries(CATEGORY_LABELS) as [BusinessCategory, string][]).map(([key, label]) => (
              <button key={key} type="button" onClick={() => selectCategory(key)}
                style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  border: '1px solid', transition: 'all 0.15s',
                  background: category === key ? '#c9a84c' : 'rgba(255,255,255,0.1)',
                  borderColor: category === key ? '#c9a84c' : 'rgba(255,255,255,0.2)',
                  color: category === key ? '#1a3a2a' : 'rgba(255,255,255,0.85)',
                }}>
                {CATEGORY_ICONS[key]} {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results area */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 24px' }}>

        {/* Filter chips + result count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {searched && (
            <span style={{ fontSize: 13, color: '#6b7280', marginRight: 4 }}>
              {loading ? 'Searching…' : `${count.toLocaleString()} result${count !== 1 ? 's' : ''}`}
            </span>
          )}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {([
              { key: 'shield', label: '🛡 Gold Shield', active: shield },
              { key: 'openNow', label: '🟢 Open Now', active: openNow },
              { key: 'mobile', label: '📱 Mobile Service', active: mobile },
              { key: 'nationwide', label: '🇺🇸 Nationwide', active: nationwide },
            ] as { key: 'shield'|'openNow'|'mobile'|'nationwide'; label: string; active: boolean }[]).map(f => (
              <button key={f.key} type="button" onClick={() => toggleFilter(f.key)}
                style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '1px solid',
                  background: f.active ? '#1a3a2a' : '#fff',
                  borderColor: f.active ? '#1a3a2a' : '#d4cfc7',
                  color: f.active ? '#fff' : '#6b7280',
                  transition: 'all 0.15s',
                }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* View toggle */}
        {searched && !loading && results.length > 0 && (
          <div style={{ display: 'flex', gap: 2, background: '#fff', border: '1px solid #d4cfc7', borderRadius: 8, padding: 3, width: 'fit-content', marginBottom: 16 }}>
            {([['list','☰ List'],['map','🗺 Map']] as ['list'|'map',string][]).map(([v,label]) => (
              <button key={v} type="button" onClick={() => setView(v)}
                style={{ padding: '7px 16px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                  background: view === v ? '#1a3a2a' : 'transparent',
                  color: view === v ? '#fff' : '#6b7280',
                }}>
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Map view */}
        {searched && !loading && view === 'map' && results.length > 0 && (
          <BusinessMap businesses={results} center={mapCenter ?? userLocation ?? undefined} />
        )}

        {/* Results */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ background: '#fff', border: '1px solid #e5e0d5', borderRadius: 12, padding: 16, height: 90, animation: 'pulse 1.5s ease infinite', opacity: 0.6 }} />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏙</div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#1a3a2a', marginBottom: 8 }}>
              No results found
            </p>
            <p style={{ fontSize: 14, color: '#6b7280', maxWidth: 400, margin: '0 auto 24px' }}>
              We may not have this area seeded yet. Help us grow the directory — add a business you know.
            </p>
            <Link href="/login?next=/onboarding"
              style={{ display: 'inline-block', background: '#1a3a2a', color: '#fff', padding: '12px 24px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              Add a Business →
            </Link>
          </div>
        ) : (
          <>
            <div>
              {results.map(biz => <BusinessCard key={biz.id} biz={biz} />)}
            </div>

            {/* Load more */}
            {results.length < count && (
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <button type="button"
                  onClick={() => {
                    const sp = new URLSearchParams()
                    if (q) sp.set('q', q)
                    if (city) sp.set('city', city)
                    if (state) sp.set('state', state)
                    if (category) sp.set('category', category)
                    if (shield) sp.set('shield', 'true')
                    if (openNow) sp.set('open', 'true')
                    if (mobile) sp.set('mobile', 'true')
                    sp.set('offset', String(results.length))
                    fetch(`/api/search?${sp}`)
                      .then(r => r.json())
                      .then(d => setResults(prev => [...prev, ...(d.results ?? [])]))
                  }}
                  style={{ padding: '12px 32px', background: '#fff', border: '1.5px solid #d4cfc7', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#1a3a2a', cursor: 'pointer' }}>
                  Load more ({count - results.length} remaining)
                </button>
              </div>
            )}

            {/* CTA to add business */}
            <div style={{ background: '#1a3a2a', borderRadius: 12, padding: '24px 28px', marginTop: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Know a business that should be here?</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>Add it free — it takes 5 minutes.</p>
              </div>
              <Link href="/login?next=/onboarding"
                style={{ background: '#c9a84c', color: '#1a3a2a', padding: '11px 22px', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Add a Business →
              </Link>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.6} 50%{opacity:0.3} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}
