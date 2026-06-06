'use client'
import { useEffect, useRef, useState } from 'react'

interface MapBusiness {
  id: string; name: string; slug: string
  lat: number | null; lng: number | null
  gold_shield: boolean; subscription_status: string
  rating_avg: number | null; category: string
}

export function BusinessMap({ businesses, center }: {
  businesses: MapBusiness[]
  center?: { lat: number; lng: number; city?: string; state?: string }
}) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const infoWindowRef = useRef<any>(null)
  const [mapsReady, setMapsReady] = useState(false)

  useEffect(() => {
    if ((window as any).google?.maps) { setMapsReady(true); return }
    const existing = document.querySelector('script[data-maps]')
    if (existing) { existing.addEventListener('load', () => setMapsReady(true)); return }
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    script.async = true; script.setAttribute('data-maps', '1')
    script.onload = () => setMapsReady(true)
    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    if (!mapsReady || !mapRef.current) return
    const google = (window as any).google
    mapInstanceRef.current = new google.maps.Map(mapRef.current, {
      center: center ?? { lat: 37.09, lng: -95.71 },
      zoom: center ? 12 : 4,
      mapTypeControl: false, fullscreenControl: false, streetViewControl: false,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'water', stylers: [{ color: '#c8e6c9' }] },
        { featureType: 'landscape', stylers: [{ color: '#f5f5f0' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
      ],
    })
    infoWindowRef.current = new google.maps.InfoWindow()
  }, [mapsReady, center])

  useEffect(() => {
    if (!mapInstanceRef.current || !mapsReady) return
    const google = (window as any).google
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []

    const plotted = businesses.filter(b => b.lat && b.lng)
    if (!plotted.length) return

    const bounds = new google.maps.LatLngBounds()

    // User location marker
    if (center?.lat && center?.lng) {
      const userMarker = new google.maps.Marker({
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
      markersRef.current.push(userMarker)
    }

    plotted.forEach(biz => {
      const isPro = biz.subscription_status === 'active'
      const isGold = biz.gold_shield
      const color = isGold ? '#c9a84c' : isPro ? '#2d6a4f' : '#1a3a2a'

      const svg = encodeURIComponent(`<svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg"><path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22S28 24.5 28 14C28 6.27 21.73 0 14 0z" fill="${color}"/><circle cx="14" cy="14" r="6" fill="white" opacity="0.9"/><circle cx="14" cy="14" r="3" fill="${color}"/></svg>`)

      const marker = new google.maps.Marker({
        position: { lat: biz.lat!, lng: biz.lng! },
        map: mapInstanceRef.current,
        title: biz.name,
        icon: { url: `data:image/svg+xml;charset=UTF-8,${svg}`, scaledSize: new google.maps.Size(28, 36), anchor: new google.maps.Point(14, 36) },
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

    if (plotted.length === 1) {
      mapInstanceRef.current.setCenter({ lat: plotted[0].lat!, lng: plotted[0].lng! })
      mapInstanceRef.current.setZoom(14)
    } else {
      mapInstanceRef.current.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 })
    }
  }, [businesses, mapsReady])

  const plottedCount = businesses.filter(b => b.lat && b.lng).length

  return (
    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e0d5', marginBottom: 20 }}>
      <div ref={mapRef} style={{ width: '100%', height: 380, background: '#e8f4eb' }} />
      <div style={{ position: 'absolute', bottom: 10, left: 10, background: '#fff', borderRadius: 8, padding: '7px 12px', display: 'flex', gap: 12, fontSize: 11, fontWeight: 600, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', color: '#6b7280' }}>
        {[['#c9a84c','Gold Shield'],['#2d6a4f','Pro Page'],['#1a3a2a','Listed']].map(([color, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
            {label}
          </div>
        ))}
      </div>
      {center?.city && (
        <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', background: '#1a3a2a', color: '#fff', padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
          📍 {center.city}{center.state ? `, ${center.state}` : ''}
        </div>
      )}
      {businesses.length > 0 && plottedCount === 0 && mapsReady && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(250,247,240,0.85)' }}>
          <p style={{ fontSize: 13, color: '#6b7280' }}>No map coordinates yet for these results.</p>
        </div>
      )}
    </div>
  )
}
