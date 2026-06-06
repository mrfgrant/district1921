import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CATEGORY_LABELS, BusinessCategory } from '@/types'

export const metadata = {
  title: 'Community Events — District 1921',
  description: 'Upcoming events from community businesses — grand openings, workshops, pop-ups, and more.',
}

export const revalidate = 3600

function formatEventDate(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const dateLabel = diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return { dateLabel, time, month: d.toLocaleString('en-US', { month: 'short' }), day: d.getDate(), isToday: diff === 0, isTomorrow: diff === 1, isSoon: diff <= 3 }
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: { category?: string; state?: string }
}) {
  const supabase = createClient()

  let query = supabase
    .from('events')
    .select(`
      id, title, description, start_date, end_date, location, is_free, created_at,
      business:businesses!inner(
        id, name, slug, category, city, state,
        logo_url, gold_shield, subscription_status
      )
    `)
    .eq('business.status', 'active')
    .eq('business.subscription_status', 'active')
    .gte('start_date', new Date().toISOString())
    .order('start_date', { ascending: true })
    .limit(48)

  if (searchParams.category) query = query.eq('business.category', searchParams.category)
  if (searchParams.state) query = query.eq('business.state', searchParams.state.toUpperCase())

  const { data: events } = await query
  const categories = Object.entries(CATEGORY_LABELS) as [BusinessCategory, string][]

  return (
    <div style={{ minHeight: '100vh', background: '#faf7f0', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1a3a2a 0%, #2d6a4f 60%, #1a4a35 100%)', padding: '48px 32px 40px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c9a84c', marginBottom: 12 }}>District 1921 · Community Events</p>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(32px,6vw,52px)', fontWeight: 900, color: '#fff', marginBottom: 8, lineHeight: 1.1 }}>
            What's happening in<br /><em style={{ color: '#c9a84c', fontStyle: 'italic' }}>the community.</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, marginBottom: 28, maxWidth: 480 }}>
            Grand openings, workshops, pop-ups, and community gatherings — all in one place.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link href="/events" style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, textDecoration: 'none', background: !searchParams.category ? '#c9a84c' : 'rgba(255,255,255,0.12)', color: !searchParams.category ? '#1a3a2a' : 'rgba(255,255,255,0.85)', border: '1px solid', borderColor: !searchParams.category ? '#c9a84c' : 'rgba(255,255,255,0.2)' }}>All Events</Link>
            {categories.map(([key, label]) => (
              <Link key={key} href={`/events?category=${key}`} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, textDecoration: 'none', background: searchParams.category === key ? '#c9a84c' : 'rgba(255,255,255,0.12)', color: searchParams.category === key ? '#1a3a2a' : 'rgba(255,255,255,0.85)', border: '1px solid', borderColor: searchParams.category === key ? '#c9a84c' : 'rgba(255,255,255,0.2)' }}>{label}</Link>
            ))}
          </div>
        </div>
      </div>

      {/* Events list */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '36px 24px' }}>
        {!events?.length ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: '#1a3a2a', marginBottom: 8 }}>No upcoming events</p>
            <p style={{ fontSize: 14, color: '#6b7280' }}>Business owners on Professional Pages can post events here.</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>{events.length} upcoming event{events.length !== 1 ? 's' : ''}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {events.map((ev: any) => {
                const biz = ev.business
                const { dateLabel, time, month, day, isSoon } = formatEventDate(ev.start_date)
                return (
                  <div key={ev.id} style={{ background: '#fff', border: '1px solid #e5e0d5', borderRadius: 14, padding: '20px 24px', display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: 20, alignItems: 'start' }}>
                    {/* Date block */}
                    <div style={{ textAlign: 'center', background: '#1a3a2a', borderRadius: 10, padding: '10px 8px' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{month}</div>
                      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{day}</div>
                    </div>
                    {/* Event info */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: '#1a3a2a', margin: 0 }}>{ev.title}</h3>
                        {ev.is_free && <span style={{ fontSize: 10, background: '#d8f3dc', color: '#2d6a4f', fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>FREE</span>}
                        {isSoon && <span style={{ fontSize: 10, background: '#fef3c7', color: '#d97706', fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>🔥 Soon</span>}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                        {dateLabel} · {time} {ev.location && `· ${ev.location}`}
                      </div>
                      <p style={{ fontSize: 13, color: '#4a4540', lineHeight: 1.65, marginBottom: 12 }}>{ev.description}</p>
                      <Link href={`/business/${biz.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', padding: '7px 12px', background: '#faf7f0', borderRadius: 8, border: '1px solid #e5e0d5' }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: biz.logo_url ? `url(${biz.logo_url}) center/cover` : '#d8f3dc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#2d6a4f', fontFamily: "'Playfair Display',serif" }}>
                          {!biz.logo_url && biz.name[0]}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#1a3a2a' }}>{biz.name}</span>
                        {biz.gold_shield && <span style={{ fontSize: 9, background: '#c9a84c', color: '#1a3a2a', padding: '1px 5px', borderRadius: 3, fontWeight: 800 }}>🛡</span>}
                        <span style={{ fontSize: 11, color: '#6b7280' }}>{biz.city}, {biz.state}</span>
                      </Link>
                    </div>
                    {/* Share */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                      <Link href={`/business/${biz.slug}`} style={{ fontSize: 12, fontWeight: 600, color: '#2d6a4f', textDecoration: 'none', padding: '6px 12px', border: '1px solid #2d6a4f', borderRadius: 6, whiteSpace: 'nowrap' }}>View Details →</Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        <div style={{ background: '#1a3a2a', borderRadius: 12, padding: '28px 32px', marginTop: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Hosting an event? List it here.</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Events are included with a Professional Page — $15/mo.</p>
          </div>
          <Link href="/login?next=/onboarding" style={{ background: '#c9a84c', color: '#1a3a2a', padding: '12px 24px', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>List Your Business →</Link>
        </div>
      </div>
    </div>
  )
}
