'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CATEGORY_LABELS, BusinessCategory } from '@/types'

const CATEGORY_ICONS: Record<string, string> = {
  'food-dining':'🍽','beauty-wellness':'💇','health-medical':'🩺',
  'legal-financial':'⚖️','home-construction':'🏗','automotive':'🚗',
  'professional-services':'💼','education-childcare':'📚',
  'retail-products':'🛒','faith-community':'⛪','real-estate':'🏠','entertainment-travel':'🎭',
}

export function HeroSearch() {
  const [q, setQ] = useState('')
  const [city, setCity] = useState('')
  const router = useRouter()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (city) params.set('city', city)
    router.push(`/search?${params}`)
  }

  return (
    <div style={{ background: 'linear-gradient(135deg, #1a3a2a 0%, #2d6a4f 60%, #1a4a35 100%)', padding: '48px 24px', textAlign: 'center' }}>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px,6vw,52px)', fontWeight: 900, color: '#fff', marginBottom: 8, lineHeight: 1.1 }}>
        Find. Support. Share.
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, marginBottom: 24 }}>
        Discover community businesses — added by owners and members alike.
      </p>
      <form onSubmit={handleSearch}>
        <div style={{ display: 'flex', maxWidth: 660, margin: '0 auto 20px', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          <div style={{ flex: 2, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8, borderRight: '1px solid #e5e0d5' }}>
            <span style={{ color: '#b0a898' }}>🔍</span>
            <input type="text" placeholder="Restaurant, salon, attorney..." value={q} onChange={e => setQ(e.target.value)}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, padding: '15px 0', background: 'transparent', color: '#1c1c1c' }} />
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8 }}>
            <span style={{ color: '#b0a898' }}>📍</span>
            <input type="text" placeholder="City or ZIP" value={city} onChange={e => setCity(e.target.value)}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, padding: '15px 0', background: 'transparent', color: '#1c1c1c' }} />
          </div>
          <button type="submit" style={{ padding: '0 24px', background: '#c9a84c', border: 'none', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: '#1a3a2a', cursor: 'pointer' }}>
            Search
          </button>
        </div>
      </form>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        {(Object.entries(CATEGORY_LABELS) as [BusinessCategory, string][]).slice(0, 7).map(([key, label]) => (
          <button key={key} type="button" onClick={() => router.push(`/search?category=${key}`)}
            style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.85)', transition: 'all 0.15s' }}>
            {CATEGORY_ICONS[key]} {label}
          </button>
        ))}
      </div>
    </div>
  )
}
