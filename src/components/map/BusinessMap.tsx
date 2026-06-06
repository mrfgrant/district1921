'use client'
import { useEffect, useRef } from 'react'

interface MapBusiness {
  id: string; name: string; slug: string
  lat: number | null; lng: number | null
  gold_shield: boolean; subscription_status: string
  rating_avg: number | null
}

interface Center {
  lat: number; lng: number
  city?: string; state?: string
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

export function BusinessMap({ businesses, center }: {
  businesses: MapBusiness[]
  center?: Center
}) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const infoWindowRef = useRef<any>(null)
  const initializedRef = useRef(false)
  const centerRef = useRef<Center | undefined>(center)
  centerRef.current = center

  // ── Initialize map once ───────────────────────────────────────
  useEffect(() => {
    if (initializedRef.current) return

    function init() {
      if (!mapRef.current || initializedRef.current) return
      const google = (window as any).google
      if (!google?.maps) return

      initializedRef.current = true

      const c = centerRef.current
      const initialCenter = c ? { lat: c.lat, lng: c.lng } : { lat: 32.9, lng: -83.4 }
      const hasCity = !!c?.city
      const initialZoom = hasCity ? 11 : 7

      mapInstanceRef.current = new google.maps.Map(mapRef.current!, {
        center: initialCenter,
        zoom: initialZoom,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        styles: [
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
          { featureType: 'water', stylers: [{ color: '#c8e6c9' }] },
          { featureType: 'landscape', stylers: [{ color: '#f5f5f0' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
        ],
      })
      infoWindowRef.current = new google.maps.InfoWindow()
    }

    if ((window as any).google?.maps) {
      init()
    } else {
      const existing = document.querySelector('script[data-maps]')
      if (!existing) {
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        script.async = true
        script.setAttribute('data-maps', '1')
        script.onload = init
        document.head.appendChild(script)
      } else {
        existing.addEventListener('load', init)
      }
    }
  }, [])

  // ── Re-center whenever center prop changes ─────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current || !center) return
    const hasCity = !!center.city

    // If we have explicit coords, use them
    mapInstanceRef.current.setCenter({ lat: center.lat, lng: center.lng })
    mapInstanceRef.current.setZoom(hasCity ? 11 : 7)
  }, [center?.lat, center?.lng, center?.city]) // eslint-disable-line

  // ── Place / refresh markers ────────────────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current) return
    const google = (window as any).google
    if (!google?.maps) return

    // Clear existing markers
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []

    const plotted = businesses.filter(b => b.lat && b.lng)

    // User location dot
    if (center?.lat && center?.lng) {
      const dot = new google.maps.Marker({
        position: { lat: center.lat, lng: center.lng },
        map: mapInstanceRef.current,
        title: 'Your location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
        zIndex: 10,
      })
      markersRef.current.push(dot)
    }

    if (!plotted.length) return

    const bounds = new google.maps.LatLngBounds()

    plotted.forEach(biz => {
      const isPro = biz.subscription_status === 'active'
      const isGold = biz.gold_shield
      const color = isGold ? '#c9a84c' : isPro ? '#2d6a4f' : '#1a3a2a'

      const svg = encodeURIComponent(
        `<svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22S28 24.5 28 14C28 6.27 21.73 0 14 0z" fill="${color}"/>
          <circle cx="14" cy="14" r="6" fill="white" opacity="0.9"/>
          <circle cx="14" cy="14" r="3" fill="${color}"/>
        </svg>`
      )

      const marker = new google.maps.Marker({
        position: { lat: biz.lat!, lng: biz.lng! },
        map: mapInstanceRef.current,
        title: biz.name,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${svg}`,
          scaledSize: new google.maps.Size(28, 36),
          anchor: new google.maps.Point(14, 36),
        },
        zIndex: isGold ? 3 : isPro ? 2 : 1,
      })

      marker.addListener('click', () => {
        infoWindowRef.current.setContent(`
          <div style="font-family:'DM Sans',sans-serif;padding:4px;max-width:200px;">
            <div style="font-weight:700;font-size:14px;color:#1a3a2a;margin-bottom:4px;">${biz.name}</div>
            ${biz.gold_shield ? '<div style="font-size:10px;color:#c9a84c;font-weight:700;margin-bottom:4px;">🛡 GOLD SHIELD</div>' : ''}
            ${biz.rating_avg ? `<div style="font-size:12px;color:#c9a84c;font-weight:600;margin-bottom:6px;">★ ${Number(biz.rating_avg).toFixed(1)}</div>` : ''}
            <a href="/business/${biz.slug}" style="display:block;background:#1a3a2a;color:#fff;padding:6px 12px;border-radius:4px;font-size:12px;font-weight:600;text-decoration:none;text-align:center;">View Page →</a>
          </div>
        `)
        infoWindowRef.current.open(mapInstanceRef.current, marker)
      })

      markersRef.current.push(marker)
      bounds.extend({ lat: biz.lat!, lng: biz.lng! })
    })

    // Only fit bounds if we have multiple results AND no explicit center is set
    // — if center is set, the re-center effect handles positioning
    if (!center && plotted.length === 1) {
      mapInstanceRef.current.setCenter({ lat: plotted[0].lat!, lng: plotted[0].lng! })
      mapInstanceRef.current.setZoom(14)
    } else if (!center && plotted.length > 1) {
      mapInstanceRef.current.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 })
    }
  }, [businesses, center?.lat, center?.lng]) // eslint-disable-line

  const plottedCount = businesses.filter(b => b.lat && b.lng).length

  return (
    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e0d5', marginBottom: 20 }}>
      <div ref={mapRef} style={{ width: '100%', height: 380, background: '#e8f4eb' }} />

      {/* Legend */}
      <div style={{ position: 'absolute', bottom: 10, left: 10, background: '#fff', borderRadius: 8, padding: '7px 12px', display: 'flex', gap: 12, fontSize: 11, fontWeight: 600, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', color: '#6b7280' }}>
        {[['#c9a84c','Gold Shield'],['#2d6a4f','Pro Page'],['#1a3a2a','Listed']].map(([color, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
            {label}
          </div>
        ))}
      </div>

      {/* City label */}
      {center?.city && (
        <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', background: '#1a3a2a', color: '#fff', padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
          📍 {center.city}{center.state ? `, ${center.state}` : ''}
        </div>
      )}

      {/* No coordinates notice */}
      {businesses.length > 0 && plottedCount === 0 && (
        <div style={{ position: 'absolute', bottom: 44, left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.92)', padding: '8px 16px', borderRadius: 8, fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          No map pins yet for these results
        </div>
      )}
    </div>
  )
}
