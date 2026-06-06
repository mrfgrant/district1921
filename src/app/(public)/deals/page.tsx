import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CATEGORY_LABELS, BusinessCategory } from '@/types'

export const metadata = {
  title: 'Community Deals — District 1921',
  description: 'Exclusive deals and offers from community businesses across all 50 states.',
}

export const revalidate = 3600

export default async function DealsPage({
  searchParams,
}: {
  searchParams: { category?: string; state?: string }
}) {
  const supabase = createClient()

  let query = supabase
    .from('deals')
    .select(`
      id, title, description, discount_text, expires_at, created_at,
      business:businesses!inner(
        id, name, slug, category, city, state,
        logo_url, gold_shield, subscription_status
      )
    `)
    .eq('business.status', 'active')
    .eq('business.subscription_status', 'active')
    .or('expires_at.is.null,expires_at.gt.now()')
    .order('created_at', { ascending: false })
    .limit(48)

  if (searchParams.category) {
    query = query.eq('business.category', searchParams.category)
  }
  if (searchParams.state) {
    query = query.eq('business.state', searchParams.state.toUpperCase())
  }

  const { data: deals } = await query

  const categories = Object.entries(CATEGORY_LABELS) as [BusinessCategory, string][]

  return (
    <div style={{ minHeight: '100vh', background: '#faf7f0', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1a3a2a 0%, #2d6a4f 60%, #1a4a35 100%)', padding: '48px 32px 40px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c9a84c', marginBottom: 12 }}>District 1921 · Community Deals</p>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(32px,6vw,52px)', fontWeight: 900, color: '#fff', marginBottom: 8, lineHeight: 1.1 }}>
            Exclusive deals from<br /><em style={{ color: '#c9a84c', fontStyle: 'italic' }}>community businesses.</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, marginBottom: 28, maxWidth: 480 }}>
            Deals posted by verified community business owners. Support local — save big.
          </p>
          {/* Category filter pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link href="/deals" style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, textDecoration: 'none', background: !searchParams.category ? '#c9a84c' : 'rgba(255,255,255,0.12)', color: !searchParams.category ? '#1a3a2a' : 'rgba(255,255,255,0.85)', border: '1px solid', borderColor: !searchParams.category ? '#c9a84c' : 'rgba(255,255,255,0.2)' }}>
              All Deals
            </Link>
            {categories.map(([key, label]) => (
              <Link key={key} href={`/deals?category=${key}`} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, textDecoration: 'none', background: searchParams.category === key ? '#c9a84c' : 'rgba(255,255,255,0.12)', color: searchParams.category === key ? '#1a3a2a' : 'rgba(255,255,255,0.85)', border: '1px solid', borderColor: searchParams.category === key ? '#c9a84c' : 'rgba(255,255,255,0.2)' }}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Deals grid */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '36px 24px' }}>
        {!deals?.length ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏷</div>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: '#1a3a2a', marginBottom: 8 }}>No deals yet</p>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Business owners on Professional Pages can post deals here.</p>
            <Link href="/login?next=/onboarding" style={{ display: 'inline-block', background: '#1a3a2a', color: '#fff', padding: '12px 24px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>List Your Business →</Link>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>{deals.length} deal{deals.length !== 1 ? 's' : ''} available</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {deals.map((deal: any) => {
                const biz = deal.business
                const expiresIn = deal.expires_at ? Math.ceil((new Date(deal.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
                return (
                  <div key={deal.id} style={{ background: '#fff', border: '1px solid #e5e0d5', borderRadius: 14, overflow: 'hidden', transition: 'box-shadow 0.2s' }}>
                    {/* Deal header */}
                    <div style={{ background: 'linear-gradient(135deg, #1a3a2a, #2d6a4f)', padding: '20px 20px 16px' }}>
                      {deal.discount_text && (
                        <div style={{ display: 'inline-block', background: '#c9a84c', color: '#1a3a2a', fontSize: 13, fontWeight: 800, padding: '4px 12px', borderRadius: 6, marginBottom: 10, letterSpacing: '0.03em' }}>
                          {deal.discount_text}
                        </div>
                      )}
                      <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4, lineHeight: 1.25 }}>{deal.title}</h3>
                      {expiresIn !== null && expiresIn <= 7 && (
                        <p style={{ fontSize: 11, color: '#f5c842', fontWeight: 600 }}>⏰ Expires in {expiresIn} day{expiresIn !== 1 ? 's' : ''}</p>
                      )}
                    </div>
                    {/* Deal body */}
                    <div style={{ padding: '16px 20px' }}>
                      <p style={{ fontSize: 13, color: '#4a4540', lineHeight: 1.65, marginBottom: 16 }}>{deal.description}</p>
                      {/* Business info */}
                      <Link href={`/business/${biz.slug}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', padding: '10px 12px', background: '#faf7f0', borderRadius: 8, border: '1px solid #e5e0d5' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: biz.logo_url ? `url(${biz.logo_url}) center/cover` : '#d8f3dc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: '#2d6a4f', flexShrink: 0 }}>
                          {!biz.logo_url && biz.name[0]}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a3a2a', display: 'flex', alignItems: 'center', gap: 6 }}>
                            {biz.name}
                            {biz.gold_shield && <span style={{ fontSize: 9, background: '#c9a84c', color: '#1a3a2a', padding: '1px 6px', borderRadius: 3, fontWeight: 800 }}>🛡</span>}
                          </div>
                          <div style={{ fontSize: 11, color: '#6b7280' }}>{biz.city}, {biz.state} · {CATEGORY_LABELS[biz.category as BusinessCategory] ?? biz.category}</div>
                        </div>
                        <span style={{ fontSize: 12, color: '#2d6a4f', fontWeight: 600, flexShrink: 0 }}>View →</span>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Owner CTA */}
        <div style={{ background: '#1a3a2a', borderRadius: 12, padding: '28px 32px', marginTop: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Own a business? Post your deals here.</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Deals are included with a Professional Page — $15/mo.</p>
          </div>
          <Link href="/login?next=/onboarding" style={{ background: '#c9a84c', color: '#1a3a2a', padding: '12px 24px', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            List Your Business →
          </Link>
        </div>
      </div>
    </div>
  )
}
