'use client'
import { useState, useEffect } from 'react'

const CREDIT_PER_REFERRAL = 15 // $15

export function ReferralDashboard({ profile, referrals }: { profile: any; referrals: any[] }) {
  const [copied, setCopied] = useState(false)
  const [code, setCode] = useState(profile?.referral_code || '')
  const [loading, setLoading] = useState(!profile?.referral_code)

  useEffect(() => {
    if (!profile?.referral_code) {
      fetch('/api/referral').then(r => r.json()).then(d => { setCode(d.code); setLoading(false) })
    }
  }, [profile?.referral_code])

  const referralUrl = `https://district1921.com/?ref=${code}`
  const credits = profile?.referral_credits_cents ?? 0
  const converted = referrals.filter(r => r.status === 'converted' || r.status === 'credited').length

  function copy() {
    navigator.clipboard?.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function share(platform: string) {
    const msg = encodeURIComponent(`I list my business on District 1921 — the community business directory. Join me: ${referralUrl}`)
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${msg}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`,
      whatsapp: `https://wa.me/?text=${msg}`,
    }
    window.open(urls[platform], '_blank')
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl text-[var(--color-gold)] mb-2">Referral Program</h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-6">
        Earn <span className="text-[var(--color-gold)] font-semibold">${CREDIT_PER_REFERRAL} credit</span> toward your subscription for every business owner you refer who signs up.
      </p>

      {/* Credit balance */}
      {credits > 0 && (
        <div style={{ background: 'rgba(201,168,76,0.1)', border: '2px solid rgba(201,168,76,0.4)', borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 32 }}>💰</div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, color: '#c9a84c' }}>${(credits / 100).toFixed(0)} credit</div>
            <div className="text-xs text-[var(--color-text-secondary)]">Applied automatically at your next renewal</div>
          </div>
        </div>
      )}

      {/* Referral link */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 mb-4">
        <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">Your Referral Link</p>
        {loading ? (
          <div className="text-sm text-[var(--color-text-secondary)]">Generating your link...</div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <div style={{ flex: 1, background: 'var(--color-midnight)', border: '1.5px solid var(--color-border)', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: 'var(--color-text)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {referralUrl}
              </div>
              <button onClick={copy}
                style={{ padding: '10px 16px', background: copied ? '#2d6a4f' : 'var(--color-gold)', color: copied ? '#fff' : 'var(--color-midnight)', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>
                {copied ? '✓ Copied!' : 'Copy Link'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { k: 'twitter', l: '𝕏 Share', c: '#1DA1F2' },
                { k: 'facebook', l: '📘 Share', c: '#1877F2' },
                { k: 'whatsapp', l: '💬 WhatsApp', c: '#25D366' },
              ].map(s => (
                <button key={s.k} onClick={() => share(s.k)}
                  style={{ flex: 1, padding: '8px', background: 'transparent', border: `1.5px solid ${s.c}33`, borderRadius: 6, fontSize: 12, fontWeight: 600, color: s.c, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                  {s.l}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Referrals', val: referrals.length },
          { label: 'Converted', val: converted },
          { label: 'Credits Earned', val: `$${(credits / 100).toFixed(0)}` },
        ].map(s => (
          <div key={s.label} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[var(--color-text)]">{s.val}</div>
            <div className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Referral history */}
      {referrals.length > 0 && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--color-border)]">
            <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wide">Referral History</p>
          </div>
          {referrals.map(r => (
            <div key={r.id} className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-border)] last:border-0">
              <div>
                <div className="text-sm text-[var(--color-text)]">{r.referral_code}</div>
                <div className="text-xs text-[var(--color-text-secondary)]">{new Date(r.created_at).toLocaleDateString()}</div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                background: r.status === 'converted' || r.status === 'credited' ? 'rgba(45,106,79,0.2)' : 'rgba(107,114,128,0.2)',
                color: r.status === 'converted' || r.status === 'credited' ? '#4CAF74' : '#9CA3AF',
              }}>
                {r.status === 'converted' ? 'Converted' : r.status === 'credited' ? 'Credited' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
