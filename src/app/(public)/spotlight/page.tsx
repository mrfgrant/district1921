import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata = { title: 'Weekly Spotlight — District 1921' }

export default async function SpotlightPage() {
  const supabase = createClient()
  const { data: spotlight } = await supabase
    .from('spotlights')
    .select('*, business:businesses(id, name, slug, category, city, state, logo_url, description, gold_shield)')
    .order('week_of', { ascending: false })
    .limit(1)
    .single()

  const biz = (spotlight as any)?.business

  return (
    <div style={{ minHeight: '100vh', background: '#faf7f0', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
      <div style={{ background: 'linear-gradient(135deg, #1a3a2a 0%, #2d6a4f 60%, #1a4a35 100%)', padding: '56px 32px 48px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c9a84c', marginBottom: 12 }}>District 1921 · Weekly Spotlight</p>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(32px,6vw,52px)', fontWeight: 900, color: '#fff', marginBottom: 8, lineHeight: 1.1 }}>
            Community <em style={{ color: '#c9a84c', fontStyle: 'italic' }}>Spotlight.</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15 }}>Each week, we shine a light on one outstanding community business.</p>
        </div>
      </div>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>
        {biz ? (
          <Link href={`/business/${biz.slug}`} style={{ textDecoration: 'none' }}>
            <div style={{ background: '#fff', border: '2px solid #c9a84c', borderRadius: 16, padding: 32, textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: 14, background: biz.logo_url ? `url(${biz.logo_url}) center/cover` : '#d8f3dc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 32, fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#2d6a4f' }}>
                {!biz.logo_url && biz.name[0]}
              </div>
              {biz.gold_shield && <div style={{ display: 'inline-block', background: '#c9a84c', color: '#1a3a2a', fontSize: 11, fontWeight: 800, padding: '3px 12px', borderRadius: 4, marginBottom: 12 }}>🛡 GOLD SHIELD</div>}
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, color: '#1a3a2a', marginBottom: 8 }}>{biz.name}</h2>
              <p style={{ fontSize: 13, color: '#2d6a4f', fontWeight: 600, marginBottom: 12 }}>{biz.city}, {biz.state}</p>
              {biz.description && <p style={{ fontSize: 15, color: '#4a4540', lineHeight: 1.7, marginBottom: 24 }}>{biz.description}</p>}
              <div style={{ display: 'inline-block', background: '#1a3a2a', color: '#fff', padding: '12px 28px', borderRadius: 8, fontSize: 14, fontWeight: 600 }}>View This Business →</div>
            </div>
          </Link>
        ) : (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🌟</div>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#1a3a2a', marginBottom: 8 }}>No spotlight yet this week</p>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Check back soon — we feature a new community business every week.</p>
            <Link href="/search" style={{ display: 'inline-block', background: '#1a3a2a', color: '#fff', padding: '12px 24px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Browse the Directory →</Link>
          </div>
        )}
      </div>
    </div>
  )
}
