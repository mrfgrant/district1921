import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CATEGORY_LABELS, BusinessCategory } from '@/types'

export const metadata = {
  title: 'Community Job Board — District 1921',
  description: 'Job opportunities from community businesses. Find your next opportunity or post a position.',
}

export const revalidate = 3600

export default async function JobsPage({
  searchParams,
}: {
  searchParams: { category?: string; remote?: string; state?: string }
}) {
  const supabase = createClient()

  let query = supabase
    .from('jobs')
    .select(`
      id, title, description, location, is_remote, pay_range, expires_at, created_at,
      business:businesses!inner(
        id, name, slug, category, city, state,
        logo_url, gold_shield, subscription_status
      )
    `)
    .eq('business.status', 'active')
    .eq('business.subscription_status', 'active')
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(48)

  if (searchParams.remote === 'true') query = query.eq('is_remote', true)
  if (searchParams.category) query = query.eq('business.category', searchParams.category)
  if (searchParams.state) query = query.eq('business.state', searchParams.state.toUpperCase())

  const { data: jobs } = await query
  const categories = Object.entries(CATEGORY_LABELS) as [BusinessCategory, string][]

  return (
    <div style={{ minHeight: '100vh', background: '#faf7f0', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1a3a2a 0%, #2d6a4f 60%, #1a4a35 100%)', padding: '48px 32px 40px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c9a84c', marginBottom: 12 }}>District 1921 · Job Board</p>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(32px,6vw,52px)', fontWeight: 900, color: '#fff', marginBottom: 8, lineHeight: 1.1 }}>
            Community businesses<br /><em style={{ color: '#c9a84c', fontStyle: 'italic' }}>hiring community.</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, marginBottom: 28, maxWidth: 480 }}>
            Jobs posted by verified community business owners. No middleman — apply directly.
          </p>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link href="/jobs" style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, textDecoration: 'none', background: !searchParams.remote && !searchParams.category ? '#c9a84c' : 'rgba(255,255,255,0.12)', color: !searchParams.remote && !searchParams.category ? '#1a3a2a' : 'rgba(255,255,255,0.85)', border: '1px solid', borderColor: !searchParams.remote && !searchParams.category ? '#c9a84c' : 'rgba(255,255,255,0.2)' }}>All Jobs</Link>
            <Link href="/jobs?remote=true" style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, textDecoration: 'none', background: searchParams.remote === 'true' ? '#c9a84c' : 'rgba(255,255,255,0.12)', color: searchParams.remote === 'true' ? '#1a3a2a' : 'rgba(255,255,255,0.85)', border: '1px solid', borderColor: searchParams.remote === 'true' ? '#c9a84c' : 'rgba(255,255,255,0.2)' }}>💻 Remote Only</Link>
            {categories.slice(0, 6).map(([key, label]) => (
              <Link key={key} href={`/jobs?category=${key}`} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, textDecoration: 'none', background: searchParams.category === key ? '#c9a84c' : 'rgba(255,255,255,0.12)', color: searchParams.category === key ? '#1a3a2a' : 'rgba(255,255,255,0.85)', border: '1px solid', borderColor: searchParams.category === key ? '#c9a84c' : 'rgba(255,255,255,0.2)' }}>{label}</Link>
            ))}
          </div>
        </div>
      </div>

      {/* Jobs list */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '36px 24px' }}>
        {!jobs?.length ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💼</div>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: '#1a3a2a', marginBottom: 8 }}>No open positions</p>
            <p style={{ fontSize: 14, color: '#6b7280' }}>Business owners on Professional Pages can post jobs here.</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>{jobs.length} open position{jobs.length !== 1 ? 's' : ''}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {jobs.map((job: any) => {
                const biz = job.business
                const daysLeft = Math.ceil((new Date(job.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                return (
                  <div key={job.id} style={{ background: '#fff', border: '1px solid #e5e0d5', borderRadius: 14, padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 700, color: '#1a3a2a', margin: 0 }}>{job.title}</h3>
                        {job.is_remote && <span style={{ fontSize: 10, background: '#e8f0fe', color: '#3c4ec4', fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>💻 Remote</span>}
                        {daysLeft <= 5 && <span style={{ fontSize: 10, background: '#fef3c7', color: '#d97706', fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>Closing soon</span>}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#6b7280', marginBottom: 12, flexWrap: 'wrap' }}>
                        <Link href={`/business/${biz.slug}`} style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: '#1a3a2a', fontWeight: 600 }}>
                          <div style={{ width: 24, height: 24, borderRadius: 5, background: biz.logo_url ? `url(${biz.logo_url}) center/cover` : '#d8f3dc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#2d6a4f', fontFamily: "'Playfair Display',serif" }}>
                            {!biz.logo_url && biz.name[0]}
                          </div>
                          {biz.name}
                          {biz.gold_shield && <span style={{ fontSize: 9, background: '#c9a84c', color: '#1a3a2a', padding: '1px 5px', borderRadius: 3, fontWeight: 800 }}>🛡</span>}
                        </Link>
                        <span>·</span>
                        <span>📍 {job.location}</span>
                        {job.pay_range && <><span>·</span><span style={{ color: '#2d6a4f', fontWeight: 600 }}>💰 {job.pay_range}</span></>}
                        <span>·</span>
                        <span>{CATEGORY_LABELS[biz.category as BusinessCategory] ?? biz.category}</span>
                      </div>

                      <p style={{ fontSize: 13, color: '#4a4540', lineHeight: 1.7, marginBottom: 0 }}>{job.description}</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
                      <Link href={`/business/${biz.slug}`}
                        style={{ background: '#1a3a2a', color: '#fff', padding: '9px 18px', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                        Apply →
                      </Link>
                      <span style={{ fontSize: 11, color: '#b0a898' }}>{daysLeft}d left</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        <div style={{ background: '#1a3a2a', borderRadius: 12, padding: '28px 32px', marginTop: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Hiring? Post your position here.</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Job listings are included with a Professional Page — $15/mo.</p>
          </div>
          <Link href="/login?next=/onboarding" style={{ background: '#c9a84c', color: '#1a3a2a', padding: '12px 24px', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>List Your Business →</Link>
        </div>
      </div>
    </div>
  )
}
