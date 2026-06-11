'use client'
import { useState } from 'react'
import { AdSlot } from '@/components/ads/AdSlot'
import Link from 'next/link'
import { CATEGORY_LABELS, BusinessCategory, BusinessHours } from '@/types'
import { formatPhone, isBusinessOpen } from '@/lib/utils'

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as const
const DAY_LABELS: Record<string,string> = {
  monday:'Monday',tuesday:'Tuesday',wednesday:'Wednesday',
  thursday:'Thursday',friday:'Friday',saturday:'Saturday',sunday:'Sunday',
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'pm' : 'am'
  const hour = h % 12 || 12
  return m === 0 ? `${hour}${ampm}` : `${hour}:${String(m).padStart(2,'0')}${ampm}`
}

function Icon({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      {d.split(' M').map((seg, i) => <path key={i} d={i === 0 ? seg : 'M' + seg} />)}
    </svg>
  )
}

const ICONS = {
  phone:    'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
  globe:    'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
  pin:      'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0',
  mail:     'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
  share:    'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8 M16 6l-4-4-4 4 M12 2v13',
  heart:    'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
  checkin:  'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0',
  shield:   'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  check:    'M20 6L9 17l-5-5',
  image:    'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 13m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0',
  back:     'M19 12H5 M12 5l-7 7 7 7',
  flag:     'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z M4 22v-7',
}

export function BusinessProfile({ business: biz, deals, events, isPaid }: {
  business: any; deals: any[]; events: any[]; isPaid: boolean
}) {
  const [checkedIn, setCheckedIn]     = useState(false)
  const [following, setFollowing]     = useState(false)
  const [checkInCount, setCheckInCount] = useState(biz.checkin_count ?? 0)
  const [copied, setCopied]           = useState(false)

  const category = CATEGORY_LABELS[biz.category as BusinessCategory] ?? biz.category
  const isOpen   = isBusinessOpen(biz.hours)
  const todayKey = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][new Date().getDay()]

  async function handleCheckIn() {
    if (checkedIn) return
    setCheckedIn(true); setCheckInCount((c: number) => c + 1)
    await fetch('/api/checkin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ businessId: biz.id }) })
  }

  async function handleFollow() {
    setFollowing(!following)
    await fetch('/api/follow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ businessId: biz.id }) })
  }

  function handleShare() {
    const url = window.location.href
    if (navigator.share) { navigator.share({ title: biz.name, url }) }
    else { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  }

  async function trackClick(type: 'phone_click'|'website_click'|'directions_click') {
    await fetch('/api/analytics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ businessId: biz.id, eventType: type }) })
  }

  const card: React.CSSProperties = { background: 'var(--surface-card)', border: '1px solid var(--rule)', borderRadius: 'var(--radius-lg)', padding: 22, marginBottom: 14 }
  const sectionHead: React.CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--ink)', marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--rule)' }

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100dvh', fontFamily: 'var(--font-body)' }}>
      <style>{`
        @media (max-width: 768px) {
          .bp-main-grid { grid-template-columns: 1fr !important; }
          .bp-sidebar { display: none; }
          .bp-cover { height: 220px !important; }
          .bp-logo-wrap { bottom: -36px !important; left: 16px !important; }
          .bp-logo { width: 72px !important; height: 72px !important; font-size: 28px !important; }
          .bp-biz-header { padding: 52px 16px 24px !important; }
          .bp-biz-name { font-size: 26px !important; }
          .bp-hero-actions { flex-wrap: wrap; gap: 8px !important; }
        }
      `}</style>

      {/* Cover */}
      <div style={{ height: 300, background: biz.cover_photo_url ? `url(${biz.cover_photo_url}) center/cover` : `url('/hero-district.png') center/cover`, position: 'relative' }}>
        {!biz.cover_photo_url && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(13,33,24,0.6) 100%)' }} />}
        <Link href="/search" style={{ position: 'absolute', top: 16, left: 20, background: 'rgba(0,0,0,0.45)', color: '#fff', padding: '7px 14px', borderRadius: 'var(--radius)', fontSize: 12, fontWeight: 600, textDecoration: 'none', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon d={ICONS.back} size={13} /> Back
        </Link>
      </div>

      {/* Profile header */}
      <div style={{ background: 'var(--forest-mid)', padding: '0 24px 24px', borderBottom: '1px solid var(--rule-mid)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'flex-end', gap: 20 }}>
          <div style={{ width: 92, height: 92, borderRadius: 'var(--radius-lg)', background: biz.logo_url ? `url(${biz.logo_url}) center/cover` : 'var(--surface-card)', border: '3px solid rgba(255,255,255,0.15)', flexShrink: 0, marginTop: -46, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 700, color: 'var(--sage-light)', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}>
            {!biz.logo_url && biz.name[0]}
          </div>
          <div style={{ flex: 1, paddingBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 5 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 4vw, 27px)', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.1, letterSpacing: '-0.01em' }}>
                {biz.name}
              </h1>
              {biz.gold_shield && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--gold)', color: 'var(--forest)', fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 3, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  <Icon d={ICONS.shield} size={10} /> GOLD SHIELD
                </span>
              )}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.62)', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span>{category}</span>
              <span style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
              <span>{biz.city}, {biz.state}</span>
              {biz.is_mobile_service && <><span style={{ color: 'rgba(255,255,255,0.25)' }}>·</span><span>Mobile Service</span></>}
              {biz.hours && (
                <><span style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
                <span style={{ background: isOpen ? 'rgba(94,203,138,0.15)' : 'rgba(224,112,112,0.15)', color: isOpen ? 'var(--open-text)' : 'var(--closed-text)', padding: '2px 8px', borderRadius: 3, fontSize: 11, fontWeight: 600 }}>
                  {isOpen ? 'Open Now' : 'Closed'}
                </span></>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div style={{ background: 'var(--surface-card)', borderBottom: '1px solid var(--rule)', padding: '12px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { label: checkedIn ? 'Checked In' : 'Check In', active: checkedIn, onClick: handleCheckIn, icon: ICONS.checkin },
            { label: following ? 'Following' : 'Follow', active: following, onClick: handleFollow, icon: ICONS.heart },
            { label: copied ? 'Copied!' : 'Share', active: false, onClick: handleShare, icon: ICONS.share },
          ].map(btn => (
            <button key={btn.label} onClick={btn.onClick} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 600, border: '1px solid',
              cursor: btn.active && btn.label !== 'Following' ? 'default' : 'pointer',
              background: btn.active ? 'var(--open-bg)' : 'transparent',
              borderColor: btn.active ? 'rgba(94,203,138,0.3)' : 'var(--rule)',
              color: btn.active ? 'var(--open-text)' : 'var(--ink-mid)',
              fontFamily: 'var(--font-body)',
              transition: 'background 140ms, border-color 140ms, color 140ms',
            }}>
              <Icon d={btn.icon} size={13} />{btn.label}
            </button>
          ))}

          <a href={`/api/og?name=${encodeURIComponent(biz.name)}&city=${encodeURIComponent(biz.city??'')}&state=${encodeURIComponent(biz.state??'')}&category=${encodeURIComponent(biz.category)}&gold=${biz.gold_shield?'1':'0'}${biz.logo_url?`&logo=${encodeURIComponent(biz.logo_url)}`:''}${biz.rating_avg?`&rating=${biz.rating_avg}`:''}`}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 'var(--radius)', border: '1px solid var(--shield-border)', background: 'var(--gold-faint)', fontSize: 13, fontWeight: 600, color: 'var(--gold)', textDecoration: 'none' }}>
            <Icon d={ICONS.image} size={13} /> Share Card
          </a>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 18, fontSize: 13, color: 'var(--ink-mid)' }}>
            {biz.rating_avg && biz.rating_count > 0 && (
              <span style={{ color: 'var(--gold)', fontWeight: 600 }}>
                ★ {Number(biz.rating_avg).toFixed(1)} <span style={{ color: 'var(--ink-mid)', fontWeight: 400 }}>({biz.rating_count})</span>
              </span>
            )}
            <span>{checkInCount.toLocaleString()} check-ins</span>
            <span>{(biz.follow_count ?? 0).toLocaleString()} followers</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="bp-main-grid" style={{ maxWidth: 960, margin: '0 auto', padding: '28px 24px', display: 'grid', gridTemplateColumns: '1fr 292px', gap: 24, alignItems: 'start' }}>

        {/* Left */}
        <div>
          {biz.description && (
            <div style={card}>
              <h2 style={sectionHead}>About</h2>
              <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--ink-soft)' }}>{biz.description}</p>
            </div>
          )}

          {biz.photos?.length > 0 && (
            <div style={card}>
              <h2 style={sectionHead}>Photos</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px,1fr))', gap: 8 }}>
                {biz.photos.map((url: string, i: number) => (
                  <a key={url} href={url} target="_blank" rel="noopener noreferrer" style={{ aspectRatio: '1', borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'block', background: 'var(--surface-2)' }}>
                    <img src={url} alt={`${biz.name} photo ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 200ms' }}
                      onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                      onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {isPaid && deals.length > 0 && (
            <div style={card}>
              <h2 style={sectionHead}>Active Deals</h2>
              {deals.map((deal: any) => (
                <div key={deal.id} style={{ border: '1px solid var(--rule)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{deal.title}</div>
                    {deal.description && <div style={{ fontSize: 12, color: 'var(--ink-mid)' }}>{deal.description}</div>}
                  </div>
                  {deal.discount_text && <span style={{ background: 'var(--gold-faint)', color: 'var(--shield-text)', border: '1px solid var(--shield-border)', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 'var(--radius)', whiteSpace: 'nowrap' }}>{deal.discount_text}</span>}
                </div>
              ))}
            </div>
          )}

          {isPaid && events.length > 0 && (
            <div style={card}>
              <h2 style={sectionHead}>Upcoming Events</h2>
              {events.map((ev: any) => (
                <div key={ev.id} style={{ border: '1px solid var(--rule)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', gap: 14, marginBottom: 8 }}>
                  <div style={{ textAlign: 'center', minWidth: 44, background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '6px 8px', border: '1px solid var(--rule)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--sage)', textTransform: 'uppercase' }}>{new Date(ev.start_date).toLocaleString('en',{month:'short'})}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>{new Date(ev.start_date).getDate()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{ev.title}</div>
                    {ev.location && <div style={{ fontSize: 12, color: 'var(--ink-mid)' }}>{ev.location}</div>}
                    {ev.is_free && <span style={{ fontSize: 11, color: 'var(--open-text)', fontWeight: 600 }}>Free</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {biz.hours && (
            <div style={card}>
              <h2 style={sectionHead}>Hours</h2>
              {DAYS.map(day => {
                const h = biz.hours[day]
                const isToday = day === todayKey
                return (
                  <div key={day} style={{ display: 'flex', justifyContent: 'space-between', padding: isToday ? '9px 12px' : '8px 0', borderBottom: '1px solid var(--rule-soft)', fontSize: 13, background: isToday ? 'rgba(58,117,80,0.06)' : 'transparent', margin: isToday ? '0 -12px' : 0, borderRadius: isToday ? 'var(--radius)' : 0 }}>
                    <span style={{ fontWeight: isToday ? 700 : 500, color: 'var(--ink)' }}>{DAY_LABELS[day]}{isToday ? ' (Today)' : ''}</span>
                    <span style={{ color: h?.closed ? 'var(--closed-text)' : isToday ? 'var(--open-text)' : 'var(--ink-mid)', fontWeight: isToday ? 600 : 400 }}>
                      {h?.closed ? 'Closed' : h ? `${formatTime(h.open)} – ${formatTime(h.close)}` : '—'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {biz.gold_shield && (
            <div style={{ background: 'var(--forest)', borderRadius: 'var(--radius-lg)', padding: 22, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ color: 'var(--gold)', flexShrink: 0 }}><Icon d={ICONS.shield} size={22} /></span>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--gold)' }}>Gold Shield Verified</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>All four verification checks passed</div>
                </div>
              </div>
              {['Secretary of State registration confirmed','Business phone verified','Website reachable and active','Owner proof photo reviewed'].map(c => (
                <div key={c} style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 8 }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 700 }}><Icon d={ICONS.check} size={11} /></span> {c}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div>
          {/* Contact — paid only */}
          {isPaid ? (
            <div style={card}>
              {biz.phone && (
                <a href={`tel:${biz.phone}`} onClick={() => trackClick('phone_click')}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--rule)', textDecoration: 'none', color: 'var(--ink)', fontSize: 13 }}>
                  <span style={{ color: 'var(--sage)', flexShrink: 0 }}><Icon d={ICONS.phone} size={15} /></span>
                  <span style={{ flex: 1 }}>{formatPhone(biz.phone)}</span>
                  <span style={{ color: 'var(--sage)', fontSize: 12, fontWeight: 600 }}>Call →</span>
                </a>
              )}
              {biz.website && (
                <a href={biz.website} target="_blank" rel="noopener noreferrer" onClick={() => trackClick('website_click')}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--rule)', textDecoration: 'none', color: 'var(--ink)', fontSize: 13 }}>
                  <span style={{ color: 'var(--sage)', flexShrink: 0 }}><Icon d={ICONS.globe} size={15} /></span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{biz.website.replace(/^https?:\/\//, '')}</span>
                  <span style={{ color: 'var(--sage)', fontSize: 12, fontWeight: 600 }}>Visit →</span>
                </a>
              )}
              {biz.address && (
                <a href={`https://maps.google.com?q=${encodeURIComponent([biz.address,biz.suite,biz.city,biz.state].filter(Boolean).join(', '))}`}
                  target="_blank" rel="noopener noreferrer" onClick={() => trackClick('directions_click')}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: biz.email ? '1px solid var(--rule)' : 'none', textDecoration: 'none', color: 'var(--ink)', fontSize: 13 }}>
                  <span style={{ color: 'var(--sage)', flexShrink: 0 }}><Icon d={ICONS.pin} size={15} /></span>
                  <span style={{ flex: 1, lineHeight: 1.45 }}>{[biz.address,biz.suite].filter(Boolean).join(', ')}<br />{biz.city}, {biz.state} {biz.zip}</span>
                  <span style={{ color: 'var(--sage)', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>Dir →</span>
                </a>
              )}
              {biz.email && (
                <a href={`mailto:${biz.email}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', textDecoration: 'none', color: 'var(--ink)', fontSize: 13 }}>
                  <span style={{ color: 'var(--sage)', flexShrink: 0 }}><Icon d={ICONS.mail} size={15} /></span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{biz.email}</span>
                  <span style={{ color: 'var(--sage)', fontSize: 12, fontWeight: 600 }}>Email →</span>
                </a>
              )}
            </div>
          ) : (
            /* Free claim CTA — no paywall, just "claim it" */
            <div style={{ background: 'var(--forest)', border: '1px solid rgba(197,146,58,0.2)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 14 }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10, opacity: 0.8 }}>For the Owner</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 8, letterSpacing: '-0.01em' }}>Is this your business?</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 14, lineHeight: 1.6 }}>
                Claim your free listing. Add hours, photos, and contact info. Upgrade to Pro anytime.
              </p>
              <Link href={`/claim/${biz.slug}`}
                style={{ display: 'block', background: 'var(--gold)', color: 'var(--forest)', padding: '11px 14px', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 700, textDecoration: 'none', textAlign: 'center', letterSpacing: '0.02em' }}>
                Claim This Listing — Free
              </Link>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 10 }}>No credit card. Takes 2 minutes.</p>
            </div>
          )}

          {/* Social links */}
          {(biz.social_facebook||biz.social_instagram||biz.social_twitter||biz.social_linkedin||biz.social_youtube||biz.social_tiktok) && (
            <div style={{ ...card, padding: '14px 18px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 10 }}>Follow</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { url: biz.social_instagram, label: 'Instagram', color: '#E1306C', prefix: 'https://instagram.com/' },
                  { url: biz.social_facebook,  label: 'Facebook',  color: '#1877F2', prefix: 'https://facebook.com/' },
                  { url: biz.social_twitter,   label: 'X / Twitter', color: 'var(--ink)', prefix: 'https://x.com/' },
                  { url: biz.social_linkedin,  label: 'LinkedIn',  color: '#0A66C2', prefix: 'https://linkedin.com/in/' },
                  { url: biz.social_youtube,   label: 'YouTube',   color: '#FF0000', prefix: 'https://youtube.com/@' },
                  { url: biz.social_tiktok,    label: 'TikTok',    color: 'var(--ink)', prefix: 'https://tiktok.com/@' },
                ].filter(s => s.url).map(s => (
                  <a key={s.label} href={s.url.startsWith('http') ? s.url : s.prefix + s.url.replace('@','')}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-block', padding: '5px 11px', borderRadius: 20, border: '1px solid var(--rule)', fontSize: 11, fontWeight: 600, color: s.color, textDecoration: 'none', background: 'transparent' }}>
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          <AdSlot placement="sidebar" city={biz.city} state={biz.state} />

          <div style={{ ...card, textAlign: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 5 }}>Know someone who'd love this?</p>
            <p style={{ fontSize: 12, color: 'var(--ink-mid)', marginBottom: 14, lineHeight: 1.5 }}>Share this listing with your community.</p>
            <button onClick={handleShare} style={{ width: '100%', background: 'var(--forest)', color: '#fff', border: 'none', padding: '10px', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              {copied ? 'Link Copied!' : 'Share This Business'}
            </button>
          </div>

          <div style={{ textAlign: 'center' }}>
            <a href={`/report?business=${biz.id}`} style={{ fontSize: 11, color: 'var(--ink-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Icon d={ICONS.flag} size={11} /> Report this listing
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
