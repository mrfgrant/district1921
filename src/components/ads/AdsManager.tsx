'use client'
import { useState } from 'react'
import Link from 'next/link'

const PLACEMENTS = [
  { key: 'sidebar', label: 'Sidebar Ad', icon: '▦', desc: 'Right sidebar on search and business pages. 280px wide. High visibility.' },
  { key: 'search_banner', label: 'Search Banner', icon: '▬', desc: 'Bottom of search results. Full-width. Great for brand awareness.' },
  { key: 'map_pin', label: 'Sponsored Map Pin', icon: '📍', desc: 'Red pin on the map with your business name. Stands out from organic pins.' },
]

const TARGETING = [
  { key: 'local', label: '📍 Local', desc: 'Your city only — default' },
  { key: 'statewide', label: '🗺 Statewide', desc: 'Entire state' },
  { key: 'nationwide', label: '🇺🇸 Nationwide', desc: 'All 50 states' },
]

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  pending:  { bg: 'rgba(201,168,76,0.15)',  color: '#c9a84c', label: 'Under Review' },
  active:   { bg: 'rgba(45,106,79,0.15)',   color: '#4CAF74', label: 'Active' },
  paused:   { bg: 'rgba(107,114,128,0.15)', color: '#9CA3AF', label: 'Paused' },
  rejected: { bg: 'rgba(198,40,40,0.15)',   color: '#EF9A9A', label: 'Rejected' },
  expired:  { bg: 'rgba(107,114,128,0.15)', color: '#9CA3AF', label: 'Expired' },
}

export function AdsManager({ business, ads: initialAds }: {
  business: { id: string; name: string; city: string; state: string }
  ads: any[]
}) {
  const [ads, setAds] = useState(initialAds)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const [form, setForm] = useState({
    headline: '',
    body: '',
    cta_text: 'Learn More',
    image_url: '',
    placement: 'sidebar',
    targeting: 'local',
    target_city: business.city,
    target_state: business.state,
    daily_budget_cents: 500,
  })

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  function setField(key: string, val: any) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const { ad } = await res.json()
      setAds(prev => [ad, ...prev])
      setShowForm(false)
      setForm({ headline: '', body: '', cta_text: 'Learn More', image_url: '', placement: 'sidebar', targeting: 'local', target_city: business.city, target_state: business.state, daily_budget_cents: 500 })
      showToast('Ad submitted for review. We\'ll approve within 24 hours.')
    }
    setLoading(false)
  }

  async function handleAction(adId: string, action: 'pause' | 'resume') {
    setActionLoading(adId)
    const res = await fetch('/api/ads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adId, action }),
    })
    if (res.ok) {
      setAds(prev => prev.map(a => a.id === adId ? { ...a, status: action === 'pause' ? 'paused' : 'active' } : a))
      showToast(action === 'pause' ? 'Ad paused.' : 'Ad resumed.')
    }
    setActionLoading(null)
  }

  const iS = { fontFamily: "'DM Sans',sans-serif" }

  return (
    <div className="max-w-3xl">
      {toast && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 1000, background: '#1a3a2a', color: '#fff', padding: '12px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl text-[var(--color-gold)]">Advertise</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Reach community members searching in your area.
          </p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-5 py-2.5 bg-[var(--color-gold)] text-[var(--color-midnight)] text-sm font-bold rounded-lg hover:bg-[#dbb95a] transition-colors">
          + Create Ad
        </button>
      </div>

      {/* How it works */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 mb-6">
        <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">How it works</p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { n: '1', t: 'Create your ad', d: 'Write your headline, copy, and choose a placement. Defaults to your city.' },
            { n: '2', t: 'Admin reviews', d: 'We review all ads within 24 hours to ensure quality and community standards.' },
            { n: '3', t: 'Goes live', d: 'Approved ads start serving immediately to community members in your target area.' },
          ].map(s => (
            <div key={s.n}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--color-gold)', color: 'var(--color-midnight)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, marginBottom: 8 }}>{s.n}</div>
              <p className="text-sm font-semibold text-[var(--color-text)] mb-1">{s.t}</p>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Create Ad Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#1C1C23', borderRadius: 16, padding: 32, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', border: '1px solid #2A2A35' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>Create Ad</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#6B6B80', fontSize: 20, cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleCreate}>
              {/* Placement */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#A09D98', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Placement</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {PLACEMENTS.map(p => (
                    <div key={p.key} onClick={() => setField('placement', p.key)}
                      style={{ border: `1.5px solid ${form.placement === p.key ? '#c9a84c' : '#2A2A35'}`, borderRadius: 8, padding: '12px 14px', cursor: 'pointer', background: form.placement === p.key ? 'rgba(201,168,76,0.08)' : '#141418', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s' }}>
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{p.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: form.placement === p.key ? '#c9a84c' : '#F0EDE8', marginBottom: 2 }}>{p.label}</div>
                        <div style={{ fontSize: 11, color: '#6B6B80', lineHeight: 1.4 }}>{p.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Targeting */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#A09D98', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Targeting</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {TARGETING.map(t => (
                    <div key={t.key} onClick={() => setField('targeting', t.key)}
                      style={{ border: `1.5px solid ${form.targeting === t.key ? '#c9a84c' : '#2A2A35'}`, borderRadius: 8, padding: '10px 12px', cursor: 'pointer', background: form.targeting === t.key ? 'rgba(201,168,76,0.08)' : '#141418', textAlign: 'center', transition: 'all 0.15s' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: form.targeting === t.key ? '#c9a84c' : '#F0EDE8', marginBottom: 3 }}>{t.label}</div>
                      <div style={{ fontSize: 10, color: '#6B6B80' }}>{t.desc}</div>
                    </div>
                  ))}
                </div>
                {form.targeting !== 'nationwide' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 8, marginTop: 8 }}>
                    <input placeholder="City" value={form.target_city} onChange={e => setField('target_city', e.target.value)}
                      disabled={form.targeting === 'statewide'}
                      style={{ padding: '10px 12px', background: '#141418', border: '1.5px solid #2A2A35', borderRadius: 6, fontSize: 13, color: form.targeting === 'statewide' ? '#6B6B80' : '#F0EDE8', outline: 'none', ...iS }} />
                    <input placeholder="State" maxLength={2} value={form.target_state} onChange={e => setField('target_state', e.target.value.toUpperCase())}
                      style={{ padding: '10px 12px', background: '#141418', border: '1.5px solid #2A2A35', borderRadius: 6, fontSize: 13, color: '#F0EDE8', outline: 'none', ...iS }} />
                  </div>
                )}
              </div>

              {/* Creative */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#A09D98', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Headline <span style={{ color: '#c62828' }}>*</span></label>
                <input required maxLength={60} placeholder="e.g. Augusta's Best Soul Food" value={form.headline} onChange={e => setField('headline', e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', background: '#141418', border: '1.5px solid #2A2A35', borderRadius: 6, fontSize: 14, color: '#F0EDE8', outline: 'none', ...iS }} />
                <div style={{ textAlign: 'right', fontSize: 11, color: '#6B6B80', marginTop: 3 }}>{form.headline.length}/60</div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#A09D98', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Ad Copy <span style={{ color: '#c62828' }}>*</span></label>
                <textarea required rows={3} maxLength={150} placeholder="Brief description of your offer or business..." value={form.body} onChange={e => setField('body', e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', background: '#141418', border: '1.5px solid #2A2A35', borderRadius: 6, fontSize: 14, color: '#F0EDE8', outline: 'none', resize: 'vertical', lineHeight: 1.6, ...iS }} />
                <div style={{ textAlign: 'right', fontSize: 11, color: '#6B6B80', marginTop: 3 }}>{form.body.length}/150</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#A09D98', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>CTA Button Text</label>
                  <input maxLength={20} value={form.cta_text} onChange={e => setField('cta_text', e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', background: '#141418', border: '1.5px solid #2A2A35', borderRadius: 6, fontSize: 14, color: '#F0EDE8', outline: 'none', ...iS }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#A09D98', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Daily Budget</label>
                  <select value={form.daily_budget_cents} onChange={e => setField('daily_budget_cents', parseInt(e.target.value))}
                    style={{ width: '100%', padding: '11px 14px', background: '#141418', border: '1.5px solid #2A2A35', borderRadius: 6, fontSize: 14, color: '#F0EDE8', outline: 'none', cursor: 'pointer', ...iS }}>
                    <option value={300}>$3/day</option>
                    <option value={500}>$5/day</option>
                    <option value={1000}>$10/day</option>
                    <option value={2500}>$25/day</option>
                    <option value={5000}>$50/day</option>
                  </select>
                </div>
              </div>

              {/* Preview */}
              {form.headline && (
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#A09D98', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Preview</label>
                  <AdPreview form={form} businessName={business.name} />
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ flex: 1, padding: '12px', background: '#141418', border: '1.5px solid #2A2A35', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#A09D98', cursor: 'pointer', ...iS }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading || !form.headline || !form.body}
                  style={{ flex: 2, padding: '12px', background: '#c9a84c', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, color: '#1a3a2a', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, ...iS }}>
                  {loading ? 'Submitting…' : 'Submit for Review →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ad list */}
      {ads.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-10 text-center">
          <div className="text-4xl mb-3">📣</div>
          <p className="font-semibold text-[var(--color-text)] mb-2">No ads yet</p>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">Create your first ad to start reaching community members in your area.</p>
          <button onClick={() => setShowForm(true)} className="px-5 py-2.5 bg-[var(--color-gold)] text-[var(--color-midnight)] text-sm font-bold rounded-lg">
            Create Your First Ad
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {ads.map(ad => {
            const s = STATUS_STYLES[ad.status] ?? STATUS_STYLES.pending
            const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : '0.0'
            return (
              <div key={ad.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-[var(--color-text)]">{ad.headline}</span>
                      <span style={{ background: s.bg, color: s.color, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>{s.label}</span>
                      <span className="text-xs text-[var(--color-text-secondary)] capitalize">{ad.placement.replace('_', ' ')}</span>
                      <span className="text-xs text-[var(--color-text-secondary)] capitalize">{ad.targeting}</span>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)]">{ad.body}</p>
                    {ad.rejection_reason && (
                      <p className="text-xs text-red-400 mt-1">Rejected: {ad.rejection_reason}</p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {ad.status === 'active' && (
                      <button onClick={() => handleAction(ad.id, 'pause')} disabled={actionLoading === ad.id}
                        className="px-3 py-1.5 text-xs font-semibold border border-[var(--color-border)] rounded text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors">
                        Pause
                      </button>
                    )}
                    {ad.status === 'paused' && (
                      <button onClick={() => handleAction(ad.id, 'resume')} disabled={actionLoading === ad.id}
                        className="px-3 py-1.5 text-xs font-semibold bg-[var(--color-gold)] text-[var(--color-midnight)] rounded hover:bg-[#dbb95a] transition-colors">
                        Resume
                      </button>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-3 border-t border-[var(--color-border)] pt-4">
                  {[
                    { label: 'Impressions', val: ad.impressions.toLocaleString() },
                    { label: 'Clicks', val: ad.clicks.toLocaleString() },
                    { label: 'CTR', val: `${ctr}%` },
                    { label: 'Spend', val: `$${(ad.spend_cents / 100).toFixed(2)}` },
                  ].map(s => (
                    <div key={s.label} className="text-center">
                      <div className="text-lg font-bold text-[var(--color-text)]">{s.val}</div>
                      <div className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function AdPreview({ form, businessName }: { form: any; businessName: string }) {
  if (form.placement === 'sidebar') {
    return (
      <div style={{ background: '#faf7f0', border: '1px solid #e5e0d5', borderRadius: 12, overflow: 'hidden', maxWidth: 280 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', color: '#b0a898', textTransform: 'uppercase', textAlign: 'right', padding: '5px 10px 0' }}>Advertisement</div>
        <div style={{ padding: '12px 14px 16px' }}>
          <div style={{ width: '100%', height: 90, borderRadius: 8, background: 'linear-gradient(135deg,#1a3a2a,#2d6a4f)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, fontFamily: "'Playfair Display',serif", fontSize: 14, fontWeight: 700, color: '#fff', textAlign: 'center', padding: '0 12px' }}>
            {form.headline}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1c1c1c', marginBottom: 4 }}>{businessName}</div>
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 10, lineHeight: 1.5 }}>{form.body}</div>
          <div style={{ display: 'block', background: '#1a3a2a', color: '#fff', textAlign: 'center', padding: '8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{form.cta_text}</div>
        </div>
      </div>
    )
  }
  if (form.placement === 'search_banner') {
    return (
      <div style={{ background: '#1a3a2a', borderRadius: 10, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 4 }}>Sponsored</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{form.headline}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>{form.body}</div>
        </div>
        <div style={{ background: '#c9a84c', color: '#1a3a2a', padding: '8px 16px', borderRadius: 6, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>{form.cta_text}</div>
      </div>
    )
  }
  if (form.placement === 'map_pin') {
    return (
      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ width: 28, height: 36, background: '#c0392b', borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
          <span style={{ transform: 'rotate(45deg)', fontSize: 12 }}>📣</span>
        </div>
        <div style={{ background: '#fff', padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, color: '#1c1c1c', boxShadow: '0 1px 4px rgba(0,0,0,0.15)', whiteSpace: 'nowrap' }}>
          {form.headline} <span style={{ color: '#c0392b' }}>· Sponsored</span>
        </div>
      </div>
    )
  }
  return null
}
