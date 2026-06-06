'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'

interface Ad {
  id: string
  business_id: string
  headline: string
  body: string
  cta_text: string
  image_url: string | null
  placement: string
  target_city: string | null
  target_state: string | null
}

function trackEvent(adId: string, eventType: 'impression' | 'click') {
  fetch('/api/ads/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adId, eventType }),
  }).catch(() => {})
}

// ─── Sidebar Ad ───────────────────────────────────────────────────────────────

export function SidebarAd({ ad, businessSlug }: { ad: Ad; businessSlug: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const tracked = useRef(false)

  useEffect(() => {
    if (!ref.current || tracked.current) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !tracked.current) {
        tracked.current = true
        trackEvent(ad.id, 'impression')
      }
    }, { threshold: 0.5 })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ad.id])

  return (
    <div ref={ref} style={{ background: '#faf7f0', border: '1px solid #e5e0d5', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ textAlign: 'right', padding: '5px 10px 0', fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', color: '#b0a898', textTransform: 'uppercase' }}>
        Advertisement
      </div>
      <div style={{ padding: '0 14px 16px' }}>
        {ad.image_url ? (
          <img src={ad.image_url} alt={ad.headline} style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, marginBottom: 10 }} />
        ) : (
          <div style={{ width: '100%', height: 100, borderRadius: 8, background: 'linear-gradient(135deg,#1a3a2a,#2d6a4f)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, fontFamily: "'Playfair Display',serif", fontSize: 14, fontWeight: 700, color: '#fff', textAlign: 'center', padding: '0 12px' }}>
            {ad.headline}
          </div>
        )}
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1c1c1c', marginBottom: 4 }}>{ad.headline}</div>
        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 10, lineHeight: 1.5 }}>{ad.body}</div>
        <Link
          href={`/business/${businessSlug}?ref=ad_${ad.id}`}
          onClick={() => trackEvent(ad.id, 'click')}
          style={{ display: 'block', background: '#1a3a2a', color: '#fff', textAlign: 'center', padding: '8px', borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
          {ad.cta_text} →
        </Link>
      </div>
    </div>
  )
}

// ─── Search Banner Ad ─────────────────────────────────────────────────────────

export function SearchBannerAd({ ad, businessSlug }: { ad: Ad; businessSlug: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const tracked = useRef(false)

  useEffect(() => {
    if (!ref.current || tracked.current) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !tracked.current) {
        tracked.current = true
        trackEvent(ad.id, 'impression')
      }
    }, { threshold: 0.5 })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ad.id])

  return (
    <div ref={ref} style={{ background: '#1a3a2a', borderRadius: 12, padding: '16px 24px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 4 }}>Sponsored</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{ad.headline}</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{ad.body}</div>
      </div>
      <Link
        href={`/business/${businessSlug}?ref=ad_${ad.id}`}
        onClick={() => trackEvent(ad.id, 'click')}
        style={{ background: '#c9a84c', color: '#1a3a2a', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
        {ad.cta_text} →
      </Link>
    </div>
  )
}

// ─── House Ad (fallback when no paid ads) ─────────────────────────────────────

export function HouseSidebarAd() {
  return (
    <div style={{ background: '#faf7f0', border: '1px solid #e5e0d5', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ textAlign: 'right', padding: '5px 10px 0', fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', color: '#b0a898', textTransform: 'uppercase' }}>
        Advertisement
      </div>
      <div style={{ padding: '0 14px 16px' }}>
        <div style={{ width: '100%', height: 100, borderRadius: 8, background: 'linear-gradient(135deg,#1a3a2a,#40916c)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 10, textAlign: 'center', padding: '0 12px' }}>
          <span style={{ fontSize: 22, marginBottom: 4 }}>📣</span>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 13, fontWeight: 700, color: '#fff' }}>Advertise Here</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>Reach community members</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1c1c1c', marginBottom: 4 }}>Put Your Business Here</div>
        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 10, lineHeight: 1.5 }}>Ad slots starting at $3/day. Geo-targeted to your city.</div>
        <Link href="/dashboard/ads" style={{ display: 'block', background: '#c9a84c', color: '#1a3a2a', textAlign: 'center', padding: '8px', borderRadius: 6, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
          Get Ad Info →
        </Link>
      </div>
    </div>
  )
}

export function HouseSearchBannerAd() {
  return (
    <div style={{ background: 'linear-gradient(135deg,#1a3a2a,#2d6a4f)', borderRadius: 12, padding: '16px 24px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 4 }}>Sponsored</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Advertise your business here</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>Reach community members searching in your area. Starting at $3/day.</div>
      </div>
      <Link href="/dashboard/ads" style={{ background: '#c9a84c', color: '#1a3a2a', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
        Learn More →
      </Link>
    </div>
  )
}
