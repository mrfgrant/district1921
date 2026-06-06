'use client'
import { useState } from 'react'
import Link from 'next/link'
import { CATEGORY_LABELS, BusinessCategory } from '@/types'

export function SpotlightPicker({ businesses, current }: { businesses: any[]; current: any }) {
  const [selected, setSelected] = useState<any>(null)
  const [blurb, setBlurb] = useState('')
  const [sendBlast, setSendBlast] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function handleSubmit() {
    if (!selected || !blurb.trim()) return
    setSubmitting(true)
    const res = await fetch('/api/spotlight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId: selected.id, blurb, sendBlast }),
    })
    if (res.ok) {
      setDone(true)
      showToast(sendBlast ? 'Spotlight set and email blast sent!' : 'Spotlight set.')
    }
    setSubmitting(false)
  }

  const filtered = businesses.filter(b =>
    !search || b.name.toLowerCase().includes(search.toLowerCase()) || b.city?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-3xl">
      {toast && <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 1000, background: '#1a3a2a', color: '#fff', padding: '12px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>{toast}</div>}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-[var(--color-gold)]">Weekly Spotlight</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">Pick one business to feature on the homepage and email blast</p>
        </div>
        <Link href="/spotlight" target="_blank" className="text-xs text-[var(--color-gold)] border border-[rgba(201,168,76,0.3)] px-3 py-1.5 rounded">Preview Page ↗</Link>
      </div>

      {/* Current spotlight */}
      {current?.business && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 mb-6 flex items-center gap-4">
          <div style={{ fontSize: 24 }}>⭐</div>
          <div>
            <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide mb-1">Current Spotlight</p>
            <p className="font-semibold text-[var(--color-text)]">{current.business.name}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Week of {current.week_of}</p>
          </div>
        </div>
      )}

      {done ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-8 text-center">
          <div style={{ fontSize: 40, marginBottom: 12 }}>🌟</div>
          <h2 className="font-display text-xl text-[var(--color-text)] mb-2">Spotlight Set!</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            {selected?.name} is now featured.{sendBlast ? ' Email blast sent to all registered users.' : ''}
          </p>
          <button onClick={() => { setDone(false); setSelected(null); setBlurb('') }}
            className="px-4 py-2 text-sm font-semibold border border-[var(--color-border)] rounded text-[var(--color-text-secondary)] hover:text-[var(--color-gold)]">
            Set Another
          </button>
        </div>
      ) : (
        <>
          {/* Business picker */}
          {!selected ? (
            <>
              <input type="text" placeholder="Search businesses..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 mb-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-colors" />
              <div className="flex flex-col gap-2">
                {filtered.map(b => (
                  <div key={b.id} onClick={() => setSelected(b)}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-[var(--color-gold)] transition-colors">
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: b.logo_url ? `url(${b.logo_url}) center/cover` : '#2A2A35', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#c9a84c', fontFamily: "'Playfair Display', serif" }}>
                      {!b.logo_url && b.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[var(--color-text)]">{b.name}</span>
                        {b.gold_shield && <span style={{ fontSize: 10, background: 'rgba(201,168,76,0.2)', color: '#c9a84c', padding: '1px 6px', borderRadius: 4, fontWeight: 800 }}>🛡</span>}
                      </div>
                      <div className="text-xs text-[var(--color-text-secondary)]">
                        {CATEGORY_LABELS[b.category as BusinessCategory] ?? b.category} · {b.city}, {b.state}
                      </div>
                    </div>
                    <span className="text-xs text-[var(--color-gold)]">Select →</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div>
              <div className="bg-[var(--color-surface)] border border-[rgba(201,168,76,0.4)] rounded-xl p-4 mb-4 flex items-center gap-4">
                <div style={{ width: 48, height: 48, borderRadius: 10, background: selected.logo_url ? `url(${selected.logo_url}) center/cover` : '#2A2A35', flexShrink: 0 }} />
                <div className="flex-1">
                  <div className="font-semibold text-[var(--color-text)]">{selected.name}</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">{selected.city}, {selected.state}</div>
                </div>
                <button onClick={() => setSelected(null)} className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-gold)]">Change</button>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">Spotlight Blurb *</label>
                <textarea rows={4} placeholder="Write a compelling 2-3 sentence description of why this business is being spotlighted this week..."
                  value={blurb} onChange={e => setBlurb(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] resize-none transition-colors" />
                <div className="text-right text-xs text-[var(--color-text-secondary)] mt-1">{blurb.length}/280</div>
              </div>

              <label className="flex items-center gap-3 mb-4 cursor-pointer">
                <input type="checkbox" checked={sendBlast} onChange={e => setSendBlast(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#c9a84c' }} />
                <div>
                  <span className="text-sm font-semibold text-[var(--color-text)]">Send email blast to all registered users</span>
                  <p className="text-xs text-[var(--color-text-secondary)]">Announces this spotlight via Resend to all community members</p>
                </div>
              </label>

              <button onClick={handleSubmit} disabled={!blurb.trim() || submitting}
                className="w-full py-3 bg-[var(--color-gold)] text-[var(--color-midnight)] font-bold rounded-lg text-sm disabled:opacity-50">
                {submitting ? (sendBlast ? 'Setting spotlight & sending blast...' : 'Setting spotlight...') : `Set Spotlight${sendBlast ? ' & Send Blast' : ''} ⭐`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
