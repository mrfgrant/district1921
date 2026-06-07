'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { AdSlot } from '@/components/ads/AdSlot'
import { BusinessMap } from '@/components/map/BusinessMap'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CATEGORY_LABELS, BusinessCategory } from '@/types'

function CategoryIcon({ category, size = 14 }: { category: string; size?: number }) {
  const icons: Record<string, string> = {
    'food-dining': 'M18 8h1a4 4 0 0 1 0 8h-1 M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z M6 1v3 M10 1v3 M14 1v3',
    'beauty-wellness': 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
    'health-medical': 'M22 12h-4l-3 9L9 3l-3 9H2',
    'legal-financial': 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    'home-construction': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
    'automotive': 'M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2',
    'professional-services': 'M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z',
    'education-childcare': 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
    'retail-products': 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0',
    'faith-community': 'M12 2v20 M2 12h20',
    'real-estate': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
    'entertainment-travel': 'M17.8 19.2L16 11l3.5-3.5C21 6 21 4.5 20 3.5c-1-1-2.5-1-3.5 0L13 7 4.8 5.2a.5.5 0 0 0-.5.8l3.6 3.6',
    'internet-services': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20',
    'programming-services': 'M16 18l6-6-6-6 M8 6l-6 6 6 6',
    'information-technology': 'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18',
    'nonprofit': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    'veteran-services': 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4',
  }
  const d = icons[category] ?? 'M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" style={{ flexShrink: 0 }}>
      {d.split(' M').map((seg, i) => (
        <path key={i} d={i === 0 ? seg : 'M' + seg} />
      ))}
    </svg>
  )
}

function isOpen(hours: any): boolean | null {
  if (!hours) return null
  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
  const today = days[new Date().getDay()]
  const h = hours[today]
  if (!h || h.closed) return false
  const now = new Date()
  const cur = now.getHours() * 60 + now.getMinutes()
  const [oh, om] = h.open.split(':').map(Number)
  const [ch, cm] = h.close.split(':').map(Number)
  return cur >= oh * 60 + om && cur < ch * 60 + cm
}

interface Business {
  id: string; name: string; slug: string; category: string
  city: string; state: string; address: string | null
  is_mobile_service: boolean; service_area?: string
  logo_url: string | null; description: string | null
  hours: any; gold_shield: boolean; subscription_status: string
  rating_avg: number | null; rating_count: number; checkin_count: number
  lat?: number; lng?: number
}

function BusinessCard({ biz, index }: { biz: Business; index: number }) {
  const openStatus = isOpen(biz.hours)
  const isPro = biz.subscription_status === 'active'
  const delay = Math.min(index, 4) * 40

  return (
    <Link href={`/business/${biz.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        className="animate-slide-up"
        style={{
          background: isPro && biz.gold_shield ? 'var(--gold-faint)' : 'var(--surface-card)',
          border: `1px solid ${isPro && biz.gold_shield ? 'var(--shield-border)' : 'var(--rule-soft)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '16px 18px',
          display: 'grid',
          gridTemplateColumns: '52px 1fr',
          gap: 14,
          cursor: 'pointer',
          position: 'relative',
          marginBottom: 8,
          animationDelay: `${delay}ms`,
          transition: 'background 160ms cubic-bezier(0.23,1,0.32,1), border-color 160ms cubic-bezier(0.23,1,0.32,1), transform 160ms cubic-bezier(0.23,1,0.32,1)',
          willChange: 'transform',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.background = 'var(--surface-hover)'
          el.style.borderColor = isPro && biz.gold_shield ? 'rgba(197,146,58,0.55)' : 'var(--rule-mid)'
          el.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.background = isPro && biz.gold_shield ? 'var(--gold-faint)' : 'var(--surface-card)'
          el.style.borderColor = isPro && biz.gold_shield ? 'var(--shield-border)' : 'var(--rule-soft)'
          el.style.transform = 'translateY(0)'
        }}
        onMouseDown={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0) scale(0.995)' }}
        onMouseUp={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)' }}
      >
        {isPro && (
          <div style={{
            position: 'absolute', top: -1, right: 14,
            background: biz.gold_shield ? 'var(--gold)' : 'var(--rule-soft)',
            color: biz.gold_shield ? 'var(--forest)' : 'var(--ink-mid)',
            fontSize: 9, fontWeight: 800, fontFamily: 'var(--font-body)',
            padding: '2px 8px', letterSpacing: '0.06em',
            borderRadius: '0 0 4px 4px', textTransform: 'uppercase',
          }}>
            {biz.gold_shield ? 'Gold Shield' : 'Pro'}
          </div>
        )}

        <div style={{
          width: 52, height: 52, borderRadius: 'var(--radius-md)', flexShrink: 0,
          background: biz.logo_url ? `url(${biz.logo_url}) center/cover no-repeat` : 'var(--rule-soft)',
          border: '1px solid var(--rule)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--sage-light)',
        }}>
          {!biz.logo_url && (biz.name?.[0]?.toUpperCase() ?? '?')}
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700,
              color: 'var(--ink)', lineHeight: 1.15, letterSpacing: '-0.01em',
            }}>
              {biz.name}
            </span>
            {biz.gold_shield && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                background: 'var(--shield-bg)', color: 'var(--shield-text)',
                border: '1px solid var(--shield-border)',
                borderRadius: 3, fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-body)',
                padding: '2px 6px', letterSpacing: '0.05em', marginTop: 2, flexShrink: 0, textTransform: 'uppercase',
              }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="var(--gold)" aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Gold Shield
              </span>
            )}
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 11, fontWeight: 600, color: 'var(--sage-light)',
            letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 5,
          }}>
            <CategoryIcon category={biz.category} size={11} />
            {CATEGORY_LABELS[biz.category as BusinessCategory] ?? biz.category}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--ink-mid)', flexWrap: 'wrap', marginBottom: 5 }}>
            {biz.rating_avg && biz.rating_count > 0 && (
              <>
                <span style={{ color: 'var(--gold)', fontSize: 11, letterSpacing: 1 }}>
                  {'★'.repeat(Math.round(biz.rating_avg))}{'☆'.repeat(5 - Math.round(biz.rating_avg))}
                </span>
                <span style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>{Number(biz.rating_avg).toFixed(1)}</span>
                <span style={{ color: 'var(--rule-mid)' }}>·</span>
              </>
            )}
            <span>{biz.city}, {biz.state}</span>
            {biz.is_mobile_service && <span style={{ background: 'rgba(94,160,220,0.12)', color: '#5a9ed8', padding: '1px 6px', borderRadius: 3, fontSize: 10, fontWeight: 600 }}>Mobile</span>}
            {biz.service_area === 'nationwide' && <span style={{ background: 'rgba(94,130,220,0.12)', color: '#7090d8', padding: '1px 6px', borderRadius: 3, fontSize: 10, fontWeight: 600 }}>Nationwide</span>}
            {biz.service_area === 'online' && <span style={{ background: 'rgba(80,180,120,0.12)', color: 'var(--open-text)', padding: '1px 6px', borderRadius: 3, fontSize: 10, fontWeight: 600 }}>Online</span>}
            {biz.service_area === 'statewide' && <span style={{ background: 'rgba(197,146,58,0.12)', color: 'var(--gold)', padding: '1px 6px', borderRadius: 3, fontSize: 10, fontWeight: 600 }}>Statewide</span>}
            {openStatus !== null && (
              <>
                <span style={{ color: 'var(--rule-mid)' }}>·</span>
                <span style={{
                  background: openStatus ? 'var(--open-bg)' : 'var(--closed-bg)',
                  color: openStatus ? 'var(--open-text)' : 'var(--closed-text)',
                  padding: '1px 7px', borderRadius: 3, fontSize: 10, fontWeight: 700, letterSpacing: '0.03em',
                }}>
                  {openStatus ? 'Open' : 'Closed'}
                </span>
              </>
            )}
          </div>

          {biz.description && (
            <p style={{
              fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.58, margin: 0,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {biz.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--surface-card)', border: '1px solid var(--rule-soft)',
      borderRadius: 'var(--radius-md)', padding: '16px 18px',
      display: 'grid', gridTemplateColumns: '52px 1fr', gap: 14, marginBottom: 8,
    }} aria-hidden="true">
      <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)' }} />
      <div>
        <div className="skeleton" style={{ height: 16, width: '55%', borderRadius: 3, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 11, width: '30%', borderRadius: 3, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 11, width: '70%', borderRadius: 3, marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 11, width: '90%', borderRadius: 3 }} />
      </div>
    </div>
  )
}

function FilterChip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{
      padding: '5px 12px', borderRadius: 'var(--radius)',
      fontSize: 12, fontWeight: 500, border: '1px solid',
      background: active ? 'var(--gold)' : 'transparent',
      borderColor: active ? 'var(--gold)' : 'var(--rule-mid)',
      color: active ? 'var(--forest)' : 'var(--ink-soft)',
      cursor: 'pointer', fontFamily: 'var(--font-body)',
      letterSpacing: '0.01em', whiteSpace: 'nowrap',
      transition: 'background 140ms cubic-bezier(0.23,1,0.32,1), border-color 140ms cubic-bezier(0.23,1,0.32,1), color 140ms cubic-bezier(0.23,1,0.32,1), transform 80ms cubic-bezier(0.23,1,0.32,1)',
    }}
      onMouseDown={e => { (e.currentTarget).style.transform = 'scale(0.97)' }}
      onMouseUp={e => { (e.currentTarget).style.transform = 'scale(1)' }}
    >
      {label}
    </button>
  )
}

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
    setLoading(true); setSearched(true)

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

      const sc = (params.state?.trim() ?? '').toUpperCase()
      const cc = params.city?.trim() ?? ''
      if (cc || sc) {
        const withCoords = (data.results ?? []).find((r: any) => r.lat && r.lng)
        if (withCoords && cc) setMapCenter({ lat: withCoords.lat, lng: withCoords.lng, city: cc, state: sc })
        else if (sc && STATE_CENTERS[sc]) setMapCenter({ ...STATE_CENTERS[sc], state: sc, city: '' })
      }
      router.replace(`/search?${sp}`, { scroll: false })
    } catch (e: any) {
      if (e.name !== 'AbortError') console.error(e)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    if (searchParams.toString()) {
      doSearch({ q, city, state, category, shield, openNow, mobile, nationwide })
      return
    }
    async function loadDefaultView() {
      setLocating(true)
      let lat = 32.9, lng = -83.4, dc = '', ds = 'GA'
      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 6000 })
          )
          lat = pos.coords.latitude; lng = pos.coords.longitude
          const gr = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&result_type=locality&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`)
          const gd = await gr.json()
          if (gd.results?.[0]) {
            for (const c of gd.results[0].address_components) {
              if (c.types.includes('locality')) dc = c.long_name
              if (c.types.includes('administrative_area_level_1')) ds = c.short_name
            }
          }
        } catch { /* geolocation denied */ }
      }
      setUserLocation({ lat, lng, city: dc, state: ds })
      setLocating(false)
      doSearch({ q: '', city: '', state: ds, category, shield, openNow, mobile, nationwide })
    }
    loadDefaultView()
  }, []) // eslint-disable-line

  useEffect(() => {
    if (searchParams.toString()) doSearch({ q, city, state, category, shield, openNow, mobile })
  }, []) // eslint-disable-line

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    doSearch({ q, city, state, category, shield, openNow, mobile, nationwide })
  }

  function toggleFilter(key: 'shield'|'openNow'|'mobile'|'nationwide') {
    const cur = { shield, openNow, mobile, nationwide }
    const next = { ...cur, [key]: !cur[key] }
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

  const btnBase: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)',
    transition: 'background 140ms cubic-bezier(0.23,1,0.32,1), color 140ms cubic-bezier(0.23,1,0.32,1), transform 80ms cubic-bezier(0.23,1,0.32,1)',
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--surface)', fontFamily: 'var(--font-body)' }}>

      <div style={{ background: 'var(--forest-mid)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '36px 24px' }}>
        <div style={{ maxWidth: 920, margin: '0 auto' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div style={{ width: 22, height: 1, background: 'var(--gold)', opacity: 0.75 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold)', opacity: 0.8 }}>
              Community Business Directory
            </span>
          </div>

          {locating && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} aria-hidden="true">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              Detecting your location...
            </div>
          )}

          <form onSubmit={handleSearch} role="search">
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.14)', marginBottom: 14 }}>
              <div style={{ flex: 2, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8, borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} aria-hidden="true">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input type="search" placeholder="Business, category, or keyword..." value={q} onChange={e => setQ(e.target.value)} aria-label="Search businesses" style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: '#fff', padding: '15px 0', background: 'transparent', fontFamily: 'var(--font-body)' }} />
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8, borderRight: '1px solid rgba(255,255,255,0.1)', minWidth: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <input type="text" placeholder="City" value={city} onChange={e => setCity(e.target.value)} aria-label="City" style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: '#fff', padding: '15px 0', background: 'transparent', fontFamily: 'var(--font-body)', minWidth: 0 }} />
              </div>
              <select value={state} onChange={e => setState(e.target.value)} aria-label="State" style={{ padding: '0 12px', border: 'none', borderRight: '1px solid rgba(255,255,255,0.1)', outline: 'none', fontSize: 13, color: state ? '#fff' : 'rgba(255,255,255,0.4)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                <option value="">State</option>
                {['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button type="submit" style={{ ...btnBase, padding: '0 26px', background: 'var(--gold)', color: 'var(--forest)', fontWeight: 700, fontSize: 13, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}
                onMouseEnter={e => { (e.currentTarget).style.background = 'var(--gold-warm)' }}
                onMouseLeave={e => { (e.currentTarget).style.background = 'var(--gold)' }}
                onMouseDown={e => { (e.currentTarget).style.transform = 'scale(0.98)' }}
                onMouseUp={e => { (e.currentTarget).style.transform = 'scale(1)' }}
              >Search</button>
            </div>
          </form>

          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }} role="group" aria-label="Browse by category">
            {(Object.entries(CATEGORY_LABELS) as [BusinessCategory, string][]).map(([key, label]) => (
              <button key={key} type="button" onClick={() => selectCategory(key)} aria-pressed={category === key} style={{
                ...btnBase,
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 3, fontSize: 12, fontWeight: 500,
                border: '1px solid',
                background: category === key ? 'var(--gold)' : 'rgba(255,255,255,0.07)',
                borderColor: category === key ? 'var(--gold)' : 'rgba(255,255,255,0.15)',
                color: category === key ? 'var(--forest)' : 'rgba(255,255,255,0.65)',
              }}
                onMouseEnter={e => { if (category !== key) { (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.3)'; (e.currentTarget).style.color = 'rgba(255,255,255,0.9)' } }}
                onMouseLeave={e => { if (category !== key) { (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.15)'; (e.currentTarget).style.color = 'rgba(255,255,255,0.65)' } }}
                onMouseDown={e => { (e.currentTarget).style.transform = 'scale(0.97)' }}
                onMouseUp={e => { (e.currentTarget).style.transform = 'scale(1)' }}
              >
                <CategoryIcon category={key} size={11} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 920, margin: '0 auto', padding: '24px 24px 48px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
          {searched && (
            <span style={{ fontSize: 13, color: 'var(--ink-mid)', marginRight: 4 }}>
              {loading ? 'Searching...' : <><strong style={{ color: 'var(--ink)', fontWeight: 600 }}>{count.toLocaleString()}</strong> result{count !== 1 ? 's' : ''}</>}
            </span>
          )}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }} role="group" aria-label="Filter results">
            <FilterChip active={shield} label="Gold Shield" onClick={() => toggleFilter('shield')} />
            <FilterChip active={openNow} label="Open Now" onClick={() => toggleFilter('openNow')} />
            <FilterChip active={mobile} label="Mobile Service" onClick={() => toggleFilter('mobile')} />
            <FilterChip active={nationwide} label="Nationwide" onClick={() => toggleFilter('nationwide')} />
          </div>
        </div>

        {searched && !loading && results.length > 0 && (
          <div style={{ display: 'flex', gap: 2, background: 'var(--surface-card)', border: '1px solid var(--rule)', borderRadius: 'var(--radius-md)', padding: 3, width: 'fit-content', marginBottom: 16 }} role="group" aria-label="View mode">
            {(['list', 'map'] as const).map(v => (
              <button key={v} type="button" onClick={() => setView(v)} aria-pressed={view === v} style={{
                ...btnBase,
                padding: '6px 15px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                background: view === v ? 'var(--gold)' : 'transparent',
                color: view === v ? 'var(--forest)' : 'var(--ink-soft)',
              }}>
                {v === 'list' ? 'List' : 'Map'}
              </button>
            ))}
          </div>
        )}

        {searched && !loading && view === 'map' && results.length > 0 && (
          <BusinessMap businesses={results} center={mapCenter ?? userLocation ?? undefined} />
        )}

        {loading && (
          <div aria-label="Loading results" aria-busy="true">
            {[1,2,3,4,5].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '72px 0' }}>
            <div style={{ width: 56, height: 56, background: 'var(--rule-soft)', border: '1px solid var(--rule)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ink-mid)" strokeWidth="1.5" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>No results found</p>
            <p style={{ fontSize: 14, color: 'var(--ink-mid)', maxWidth: 360, margin: '0 auto 28px', lineHeight: 1.6 }}>
              This area may not be seeded yet. Help the directory grow.
            </p>
            <Link href="/login?next=/onboarding" style={{ display: 'inline-block', background: 'var(--gold)', color: 'var(--forest)', padding: '11px 24px', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.02em' }}>
              Add a Business
            </Link>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <div role="list" aria-label="Search results">
              {results.map((biz, i) => (
                <div key={biz.id} role="listitem">
                  <BusinessCard biz={biz} index={i} />
                </div>
              ))}
            </div>

            {results.length >= 4 && (
              <div style={{ margin: '8px 0' }}>
                <AdSlot placement="search_banner" city={city} state={state} />
              </div>
            )}

            {results.length < count && (
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <button type="button" onClick={() => {
                  const sp = new URLSearchParams()
                  if (q) sp.set('q', q)
                  if (city) sp.set('city', city)
                  if (state) sp.set('state', state)
                  if (category) sp.set('category', category)
                  if (shield) sp.set('shield', 'true')
                  if (openNow) sp.set('open', 'true')
                  if (mobile) sp.set('mobile', 'true')
                  sp.set('offset', String(results.length))
                  fetch(`/api/search?${sp}`).then(r => r.json()).then(d => setResults(prev => [...prev, ...(d.results ?? [])]))
                }} style={{
                  ...btnBase,
                  padding: '11px 28px', border: '1px solid var(--rule)',
                  borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)',
                }}
                  onMouseEnter={e => { (e.currentTarget).style.background = 'var(--surface-hover)'; (e.currentTarget).style.color = 'var(--ink)' }}
                  onMouseLeave={e => { (e.currentTarget).style.background = 'none'; (e.currentTarget).style.color = 'var(--ink-soft)' }}
                  onMouseDown={e => { (e.currentTarget).style.transform = 'scale(0.98)' }}
                  onMouseUp={e => { (e.currentTarget).style.transform = 'scale(1)' }}
                >
                  Load more — {count - results.length} remaining
                </button>
              </div>
            )}

            <div style={{ background: 'var(--forest)', border: '1px solid var(--forest-mid)', borderRadius: 'var(--radius-lg)', padding: '24px 28px', marginTop: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4, letterSpacing: '-0.01em' }}>
                  Know a business that should be here?
                </p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.58)' }}>
                  Any community member can add a listing. No cost, no gatekeeping.
                </p>
              </div>
              <Link href="/login?next=/onboarding" style={{ background: 'var(--gold)', color: 'var(--forest)', padding: '11px 22px', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', letterSpacing: '0.02em', display: 'inline-block' }}>
                Add a Business
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
