'use client'
import { useState } from 'react'
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

export function BusinessProfile({ business: biz, deals, events, isPaid }: {
  business: any
  deals: any[]
  events: any[]
  isPaid: boolean
}) {
  const [checkedIn, setCheckedIn] = useState(false)
  const [following, setFollowing] = useState(false)
  const [checkInCount, setCheckInCount] = useState(biz.checkin_count ?? 0)
  const [copied, setCopied] = useState(false)

  const category = CATEGORY_LABELS[biz.category as BusinessCategory] ?? biz.category
  const isOpen = isBusinessOpen(biz.hours)
  const todayKey = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][new Date().getDay()]

  async function handleCheckIn() {
    if (checkedIn) return
    setCheckedIn(true)
    setCheckInCount((c: number) => c + 1)
    await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId: biz.id }),
    })
  }

  async function handleFollow() {
    setFollowing(!following)
    await fetch('/api/follow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId: biz.id }),
    })
  }

  function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: biz.name, url })
    } else {
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  async function trackClick(type: 'phone_click' | 'website_click' | 'directions_click') {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId: biz.id, eventType: type }),
    })
  }

  return (
    <div style={{ background: '#faf7f0', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        .bp * { box-sizing: border-box; }
      `}</style>

      <div className="bp">
        {/* Cover */}
        <div style={{
          height: 220,
          background: biz.cover_photo_url
            ? `url(${biz.cover_photo_url}) center/cover`
            : 'linear-gradient(135deg, #1a3a2a 0%, #2d6a4f 60%, #40916c 100%)',
          position: 'relative',
        }}>
          {/* Back button */}
          <Link href="/search" style={{
            position: 'absolute', top: 16, left: 20,
            background: 'rgba(0,0,0,0.4)', color: '#fff',
            padding: '7px 14px', borderRadius: 6, fontSize: 12,
            fontWeight: 600, textDecoration: 'none', backdropFilter: 'blur(4px)',
          }}>
            ← Back
          </Link>
        </div>

        {/* Profile header */}
        <div style={{ background: '#1a3a2a', padding: '0 24px 24px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'flex-end', gap: 20, paddingTop: 0 }}>
            {/* Logo */}
            <div style={{
              width: 88, height: 88, borderRadius: 14,
              background: biz.logo_url ? `url(${biz.logo_url}) center/cover` : '#fff',
              border: '3px solid #fff', flexShrink: 0, marginTop: -44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Playfair Display', serif", fontSize: 36,
              fontWeight: 700, color: '#2d6a4f',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}>
              {!biz.logo_url && biz.name[0]}
            </div>

            <div style={{ flex: 1, paddingBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                <h1 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 900,
                  color: '#fff', margin: 0, lineHeight: 1.1,
                }}>
                  {biz.name}
                </h1>
                {biz.gold_shield && (
                  <span style={{
                    background: '#c9a84c', color: '#1a3a2a',
                    fontSize: 10, fontWeight: 800, padding: '3px 10px',
                    borderRadius: 4, letterSpacing: '0.06em', whiteSpace: 'nowrap',
                  }}>
                    🛡 GOLD SHIELD
                  </span>
                )}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <span>{category}</span>
                <span>·</span>
                <span>{biz.city}, {biz.state}</span>
                {biz.is_mobile_service && <><span>·</span><span>📱 Mobile Service</span></>}
                {biz.hours && (
                  <>
                    <span>·</span>
                    <span style={{
                      background: isOpen ? 'rgba(46,125,50,0.3)' : 'rgba(198,40,40,0.3)',
                      color: isOpen ? '#81c784' : '#ef9a9a',
                      padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                    }}>
                      {isOpen ? 'Open Now' : 'Closed'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e5e0d5', padding: '12px 24px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={handleCheckIn} disabled={checkedIn}
              style={{
                padding: '9px 18px', borderRadius: 6, fontSize: 13, fontWeight: 600,
                background: checkedIn ? '#d8f3dc' : '#1a3a2a',
                color: checkedIn ? '#2d6a4f' : '#fff', border: 'none', cursor: checkedIn ? 'default' : 'pointer',
                transition: 'all 0.2s',
              }}>
              {checkedIn ? '✓ Checked In' : '📍 Check In'}
            </button>

            <button onClick={handleFollow}
              style={{
                padding: '9px 18px', borderRadius: 6, fontSize: 13, fontWeight: 600,
                background: following ? '#d8f3dc' : '#fff', border: '1.5px solid #d4cfc7',
                color: following ? '#2d6a4f' : '#6b7280', cursor: 'pointer',
              }}>
              {following ? '✓ Following' : '♡ Follow'}
            </button>

            <button onClick={handleShare}
              style={{
                padding: '9px 18px', borderRadius: 6, fontSize: 13, fontWeight: 600,
                background: '#fff', border: '1.5px solid #d4cfc7',
                color: '#6b7280', cursor: 'pointer',
              }}>
              {copied ? '✓ Copied!' : '↗ Share'}
            </button>

            {/* Stats */}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 20, fontSize: 13, color: '#6b7280' }}>
              {biz.rating_avg && biz.rating_count > 0 && (
                <span style={{ color: '#c9a84c', fontWeight: 600 }}>
                  ★ {Number(biz.rating_avg).toFixed(1)}
                  <span style={{ color: '#6b7280', fontWeight: 400 }}> ({biz.rating_count})</span>
                </span>
              )}
              <span>👥 {checkInCount.toLocaleString()} check-ins</span>
              <span>♡ {(biz.follow_count ?? 0).toLocaleString()} followers</span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 24px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28, alignItems: 'start' }}>

          {/* Left column */}
          <div>
            {/* About */}
            {biz.description && (
              <div style={{ background: '#fff', border: '1px solid #e5e0d5', borderRadius: 12, padding: 24, marginBottom: 20 }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#1a3a2a', marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #e5e0d5' }}>About</h2>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: '#4a4540' }}>{biz.description}</p>
              </div>
            )}

            {/* Deals */}
            {isPaid && deals.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid #e5e0d5', borderRadius: 12, padding: 24, marginBottom: 20 }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#1a3a2a', marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #e5e0d5' }}>Active Deals</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {deals.map((deal: any) => (
                    <div key={deal.id} style={{ border: '1px solid #e5e0d5', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1c1c1c', marginBottom: 2 }}>{deal.title}</div>
                        {deal.description && <div style={{ fontSize: 12, color: '#6b7280' }}>{deal.description}</div>}
                      </div>
                      {deal.discount_text && (
                        <span style={{ background: '#f5e6c0', color: '#7a5c00', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 6, whiteSpace: 'nowrap' }}>
                          {deal.discount_text}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Events */}
            {isPaid && events.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid #e5e0d5', borderRadius: 12, padding: 24, marginBottom: 20 }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#1a3a2a', marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #e5e0d5' }}>Upcoming Events</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {events.map((ev: any) => (
                    <div key={ev.id} style={{ border: '1px solid #e5e0d5', borderRadius: 8, padding: '12px 16px', display: 'flex', gap: 14 }}>
                      <div style={{ textAlign: 'center', minWidth: 44, background: '#f5f0e8', borderRadius: 6, padding: '6px 8px' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#2d6a4f', textTransform: 'uppercase' }}>
                          {new Date(ev.start_date).toLocaleString('en', { month: 'short' })}
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 900, color: '#1a3a2a', lineHeight: 1 }}>
                          {new Date(ev.start_date).getDate()}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1c1c1c', marginBottom: 2 }}>{ev.title}</div>
                        {ev.location && <div style={{ fontSize: 12, color: '#6b7280' }}>{ev.location}</div>}
                        {ev.is_free && <span style={{ fontSize: 11, color: '#2d6a4f', fontWeight: 600 }}>Free</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hours */}
            {biz.hours && (
              <div style={{ background: '#fff', border: '1px solid #e5e0d5', borderRadius: 12, padding: 24, marginBottom: 20 }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#1a3a2a', marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #e5e0d5' }}>Hours</h2>
                {DAYS.map(day => {
                  const h = biz.hours[day]
                  const isToday = day === todayKey
                  return (
                    <div key={day} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: isToday ? '9px 12px' : '8px 0',
                      borderBottom: '1px solid #f0ebe0', fontSize: 13,
                      background: isToday ? '#f0faf4' : 'transparent',
                      margin: isToday ? '0 -12px' : 0,
                      borderRadius: isToday ? 6 : 0,
                    }}>
                      <span style={{ fontWeight: isToday ? 700 : 500, color: isToday ? '#1a3a2a' : '#1c1c1c' }}>
                        {DAY_LABELS[day]}{isToday ? ' (Today)' : ''}
                      </span>
                      <span style={{ color: h?.closed ? '#c62828' : isToday ? '#2d6a4f' : '#6b7280', fontWeight: isToday ? 600 : 400 }}>
                        {h?.closed ? 'Closed' : h ? `${formatTime(h.open)} – ${formatTime(h.close)}` : '—'}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Gold Shield details */}
            {biz.gold_shield && (
              <div style={{ background: '#1a3a2a', borderRadius: 12, padding: 24, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 28 }}>🛡</span>
                  <div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: '#c9a84c' }}>Gold Shield Verified</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>All four verification checks passed</div>
                  </div>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {['Secretary of State registration confirmed','Business phone verified','Website reachable and active','Owner proof photo reviewed'].map(check => (
                    <li key={check} style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 8 }}>
                      <span style={{ color: '#c9a84c', fontWeight: 700 }}>✓</span> {check}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div>
            {/* Contact card — paid only */}
            {isPaid ? (
              <div style={{ background: '#fff', border: '1px solid #e5e0d5', borderRadius: 12, padding: 20, marginBottom: 16 }}>
                {biz.phone && (
                  <a href={`tel:${biz.phone}`} onClick={() => trackClick('phone_click')}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #e5e0d5', textDecoration: 'none', color: '#1c1c1c', fontSize: 13 }}>
                    <span style={{ fontSize: 18, width: 22, textAlign: 'center' }}>📞</span>
                    <span style={{ flex: 1 }}>{formatPhone(biz.phone)}</span>
                    <span style={{ color: '#2d6a4f', fontSize: 12, fontWeight: 600 }}>Call →</span>
                  </a>
                )}
                {biz.website && (
                  <a href={biz.website} target="_blank" rel="noopener noreferrer" onClick={() => trackClick('website_click')}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #e5e0d5', textDecoration: 'none', color: '#1c1c1c', fontSize: 13 }}>
                    <span style={{ fontSize: 18, width: 22, textAlign: 'center' }}>🌐</span>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
                      {biz.website.replace(/^https?:\/\//, '')}
                    </span>
                    <span style={{ color: '#2d6a4f', fontSize: 12, fontWeight: 600 }}>Visit →</span>
                  </a>
                )}
                {biz.address && (
                  <a href={`https://maps.google.com?q=${encodeURIComponent([biz.address, biz.suite, biz.city, biz.state].filter(Boolean).join(', '))}`}
                    target="_blank" rel="noopener noreferrer" onClick={() => trackClick('directions_click')}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: biz.email ? '1px solid #e5e0d5' : 'none', textDecoration: 'none', color: '#1c1c1c', fontSize: 13 }}>
                    <span style={{ fontSize: 18, width: 22, textAlign: 'center' }}>📍</span>
                    <span style={{ flex: 1, lineHeight: 1.4 }}>
                      {[biz.address, biz.suite].filter(Boolean).join(', ')}<br />
                      {biz.city}, {biz.state} {biz.zip}
                    </span>
                    <span style={{ color: '#2d6a4f', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>Dir →</span>
                  </a>
                )}
                {biz.email && (
                  <a href={`mailto:${biz.email}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', textDecoration: 'none', color: '#1c1c1c', fontSize: 13 }}>
                    <span style={{ fontSize: 18, width: 22, textAlign: 'center' }}>✉️</span>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{biz.email}</span>
                    <span style={{ color: '#2d6a4f', fontSize: 12, fontWeight: 600 }}>Email →</span>
                  </a>
                )}
              </div>
            ) : (
              <div style={{ background: '#f5e6c0', border: '1px solid #e8d090', borderRadius: 12, padding: 20, marginBottom: 16, textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: '#5a4a20', marginBottom: 14, lineHeight: 1.6 }}>
                  <strong>Is this your business?</strong> Upgrade to a Professional Page to show your contact info, hours, deals, and more.
                </p>
                <Link href="/dashboard/billing"
                  style={{ display: 'block', background: '#1a3a2a', color: '#fff', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                  Upgrade for $15/mo
                </Link>
              </div>
            )}

            {/* Recommend card */}
            <div style={{ background: '#fff', border: '1px solid #e5e0d5', borderRadius: 12, padding: 20, marginBottom: 16, textAlign: 'center' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#1a3a2a', marginBottom: 6 }}>Know someone who'd love this?</p>
              <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 14, lineHeight: 1.5 }}>Share this listing with your community.</p>
              <button onClick={handleShare}
                style={{ width: '100%', background: '#1a3a2a', color: '#fff', border: 'none', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {copied ? '✓ Link Copied!' : '↗ Share This Business'}
              </button>
            </div>

            {/* Report link */}
            <div style={{ textAlign: 'center' }}>
              <a href={`/report?business=${biz.id}`}
                style={{ fontSize: 11, color: '#b0a898', textDecoration: 'none' }}>
                Report this listing
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
