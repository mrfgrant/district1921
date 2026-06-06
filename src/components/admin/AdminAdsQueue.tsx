'use client'
import { useState } from 'react'
import Link from 'next/link'

export function AdminAdsQueue({ ads: initial }: { ads: any[] }) {
  const [ads, setAds] = useState(initial)
  const [loading, setLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function handleAction(adId: string, action: 'approve' | 'reject', reason?: string) {
    setLoading(adId)
    const res = await fetch('/api/admin/ads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adId, action, reason }),
    })
    if (res.ok) {
      setAds(prev => prev.filter(a => a.id !== adId))
      setRejectingId(null)
      setRejectReason('')
      showToast(action === 'approve' ? 'Ad approved — now serving.' : 'Ad rejected.')
    }
    setLoading(null)
  }

  const PLACEMENT_LABELS: Record<string, string> = {
    sidebar: 'Sidebar', search_banner: 'Search Banner', map_pin: 'Map Pin',
  }

  return (
    <div className="max-w-4xl">
      {toast && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 1000, background: '#1a3a2a', color: '#fff', padding: '12px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-[var(--color-gold)]">Ad Queue</h1>
        <Link href="/admin" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-gold)]">← Overview</Link>
      </div>

      {ads.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">✓</div>
          <p className="font-semibold text-[var(--color-text)]">No pending ads</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {ads.map(ad => (
            <div key={ad.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-[var(--color-text)]">{ad.headline}</span>
                      <span className="text-xs px-2 py-0.5 bg-[var(--color-border)] text-[var(--color-text-secondary)] rounded">{PLACEMENT_LABELS[ad.placement] ?? ad.placement}</span>
                      <span className="text-xs px-2 py-0.5 bg-[var(--color-border)] text-[var(--color-text-secondary)] rounded capitalize">{ad.targeting}</span>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-1">{ad.body}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      CTA: <span className="text-[var(--color-text)]">{ad.cta_text}</span>
                      {ad.target_city && <> · Target: {ad.target_city}, {ad.target_state}</>}
                      {ad.business && <> · <Link href={`/business/${ad.business.slug}`} className="text-[var(--color-gold)] hover:underline">{ad.business.name}</Link></>}
                      {ad.owner && <> · {ad.owner.email}</>}
                    </p>
                  </div>
                </div>

                {ad.image_url && (
                  <div className="mb-4">
                    <img src={ad.image_url} alt="Ad creative" style={{ maxHeight: 120, borderRadius: 8, border: '1px solid var(--color-border)' }} />
                  </div>
                )}

                {rejectingId === ad.id ? (
                  <div className="space-y-2">
                    <input
                      placeholder="Reason for rejection..."
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[var(--color-midnight)] border border-[var(--color-border)] rounded text-[var(--color-text)] outline-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => setRejectingId(null)}
                        className="px-4 py-1.5 text-xs border border-[var(--color-border)] rounded text-[var(--color-text-secondary)]">
                        Cancel
                      </button>
                      <button onClick={() => handleAction(ad.id, 'reject', rejectReason)} disabled={!rejectReason.trim()}
                        className="px-4 py-1.5 text-xs bg-red-900/30 border border-red-800 rounded text-red-400 disabled:opacity-40">
                        Confirm Reject
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setRejectingId(ad.id)}
                      className="px-4 py-1.5 text-xs font-semibold border border-red-800 text-red-400 rounded hover:bg-red-900/20 transition-colors">
                      Reject
                    </button>
                    <button onClick={() => handleAction(ad.id, 'approve')} disabled={loading === ad.id}
                      className="px-5 py-1.5 text-xs font-bold bg-[#2d6a4f] text-white rounded hover:bg-[#1a3a2a] transition-colors disabled:opacity-50">
                      {loading === ad.id ? 'Approving…' : '✓ Approve'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
