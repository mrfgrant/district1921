'use client'
import { useState } from 'react'
import Link from 'next/link'

export function BillingPanel({ business, userEmail, justUpgraded, justPaidShield }: {
  business: any
  userEmail: string
  justUpgraded: boolean
  justPaidShield: boolean
}) {
  const [loading, setLoading] = useState<string | null>(null)
  const isPro = business.subscription_status === 'active'

  async function startCheckout(type: 'subscription' | 'gold_shield') {
    setLoading(type)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId: business.id, type }),
    })
    const { url, error } = await res.json()
    if (url) window.location.href = url
    else { console.error(error); setLoading(null) }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl text-[var(--color-gold)] mb-6">Billing</h1>

      {justUpgraded && (
        <div className="bg-green-900/20 border border-green-800 rounded-xl px-5 py-4 mb-6">
          <p className="font-semibold text-green-400 mb-1">✓ Welcome to Professional</p>
          <p className="text-sm text-green-600">Your page is now fully unlocked.</p>
        </div>
      )}

      {justPaidShield && (
        <div className="bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.3)] rounded-xl px-5 py-4 mb-6">
          <p className="font-semibold text-[var(--color-gold)] mb-1">🛡 Gold Shield payment received</p>
          <p className="text-sm text-[var(--color-text-secondary)]">We'll review your proof photo within 48 hours.</p>
        </div>
      )}

      {/* Current plan */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-[var(--color-text)]">{isPro ? 'Professional Page' : 'Free Listing'}</p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
              {isPro ? '$90 / 6 months · auto-renews' : 'No cost — basic listing only'}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${isPro ? 'bg-[rgba(201,168,76,0.2)] text-[var(--color-gold)]' : 'bg-[var(--color-border)] text-[var(--color-text-secondary)]'}`}>
            {isPro ? 'Active' : 'Free'}
          </span>
        </div>

        {!isPro && (
          <>
            <div className="border-t border-[var(--color-border)] pt-4 mb-4">
              <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">What you unlock with Pro:</p>
              <div className="grid grid-cols-2 gap-2">
                {['Logo & photos','Phone, website, email','Hours & location','Post deals & events','Job listings','Community leads','Analytics dashboard','Priority search placement'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <span className="text-[var(--color-gold)]">✓</span> {f}
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => startCheckout('subscription')} disabled={loading === 'subscription'}
              className="w-full py-3 bg-[var(--color-gold)] text-[var(--color-midnight)] font-bold text-sm rounded-lg hover:bg-[#dbb95a] transition-colors disabled:opacity-50">
              {loading === 'subscription' ? 'Redirecting…' : 'Upgrade to Pro — $15/mo →'}
            </button>
          </>
        )}
      </div>

      {/* Gold Shield */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
        <div className="flex items-start gap-4">
          <span className="text-3xl">🛡</span>
          <div className="flex-1">
            <p className="font-semibold text-[var(--color-text)] mb-1">Gold Shield Verification</p>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed">
              One-time $25 fee. Verified via Secretary of State lookup, phone check, website reachability, and a proof photo review. Earned — not purchased.
              {!isPro && <span className="text-[var(--color-gold)]"> Requires an active Professional Page.</span>}
            </p>
            {business.gold_shield ? (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[rgba(201,168,76,0.15)] border border-[rgba(201,168,76,0.3)] rounded-lg text-sm font-semibold text-[var(--color-gold)]">
                🛡 Gold Shield Active
              </span>
            ) : (
              <button
                onClick={() => startCheckout('gold_shield')}
                disabled={!isPro || loading === 'gold_shield'}
                className="px-6 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text)] rounded-lg hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {loading === 'gold_shield' ? 'Redirecting…' : 'Apply for Gold Shield — $25'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
