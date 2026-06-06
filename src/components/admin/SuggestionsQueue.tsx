'use client'
import { useState } from 'react'

export function SuggestionsQueue({ suggestions: initial }: { suggestions: any[] }) {
  const [suggestions, setSuggestions] = useState(initial)
  const [converting, setConverting] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3500) }

  async function convertToListing(s: any) {
    setConverting(s.id)
    const res = await fetch('/api/admin/businesses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: s.business_name,
        category: 'professional-services',
        city: s.business_city?.split(',')[0]?.trim() || '',
        state: s.business_city?.split(',')[1]?.trim().slice(0, 2).toUpperCase() || '',
        subscription_status: 'none',
        gold_shield: false,
        honor_pledge: false,
      }),
    })
    if (res.ok) {
      showToast(`"${s.business_name}" created as a free listing.`)
    } else {
      showToast('Failed to create listing.')
    }
    setConverting(null)
  }

  async function resendOwnerEmail(s: any) {
    if (!s.owner_email) return
    const res = await fetch('/api/admin/resend-outreach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ suggestionId: s.id, businessName: s.business_name, businessCity: s.business_city, ownerEmail: s.owner_email, suggesterEmail: s.email }),
    })
    if (res.ok) showToast(`Outreach resent to ${s.owner_email}`)
  }

  const total = suggestions.length
  const withOwner = suggestions.filter(s => s.owner_email).length
  const notified = suggestions.filter(s => s.notified_at).length

  return (
    <div className="max-w-4xl">
      {toast && <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 1000, background: '#1a3a2a', color: '#fff', padding: '12px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>{toast}</div>}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl text-[var(--color-gold)]">Suggested Businesses</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{total} suggestions · {withOwner} with owner email · {notified} owners notified</p>
        </div>
      </div>

      {suggestions.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">📬</div>
          <p className="font-semibold text-[var(--color-text)]">No suggestions yet</p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Business suggestions from the community will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {suggestions.map(s => (
            <div key={s.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="font-semibold text-[var(--color-text)] text-base">{s.business_name}</span>
                    {s.notified_at && <span style={{ fontSize: 10, background: 'rgba(45,106,79,0.2)', color: '#4CAF74', padding: '1px 7px', borderRadius: 4, fontWeight: 700 }}>Owner Notified</span>}
                    {s.owner_email && !s.notified_at && <span style={{ fontSize: 10, background: 'rgba(201,168,76,0.2)', color: '#c9a84c', padding: '1px 7px', borderRadius: 4, fontWeight: 700 }}>Owner Email Available</span>}
                  </div>
                  <div className="flex flex-col gap-1">
                    {s.business_city && (
                      <div className="text-sm text-[var(--color-text-secondary)]">📍 {s.business_city}</div>
                    )}
                    {s.owner_email && (
                      <div className="text-sm text-[var(--color-text-secondary)]">
                        🏢 Owner: <span className="text-[var(--color-text)]">{s.owner_email}</span>
                        {s.notified_at && <span className="text-xs text-[var(--color-text-secondary)] ml-2">· Notified {new Date(s.notified_at).toLocaleDateString()}</span>}
                      </div>
                    )}
                    {s.email && (
                      <div className="text-sm text-[var(--color-text-secondary)]">👤 Suggested by: {s.email}</div>
                    )}
                    <div className="text-xs text-[var(--color-text-secondary)]">
                      {new Date(s.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button onClick={() => convertToListing(s)} disabled={converting === s.id}
                    className="px-4 py-1.5 text-xs font-bold bg-[var(--color-gold)] text-[var(--color-midnight)] rounded hover:bg-[#dbb95a] transition-colors disabled:opacity-50">
                    {converting === s.id ? 'Creating...' : '+ Add to Directory'}
                  </button>
                  {s.owner_email && (
                    <button onClick={() => resendOwnerEmail(s)}
                      className="px-4 py-1.5 text-xs font-semibold border border-[var(--color-border)] rounded text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors">
                      Resend Invite →
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
