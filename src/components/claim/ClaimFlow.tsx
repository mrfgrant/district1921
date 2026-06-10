'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CATEGORY_LABELS, BusinessCategory } from '@/types'

type Stage = 'verify' | 'submitting' | 'done'

export function ClaimFlow({ business: biz, userId }: {
  business: {
    id: string; name: string; slug: string; category: string
    city: string; state: string; address: string | null
    phone: string | null; website: string | null
    owner_id: string | null; gold_shield: boolean
    subscription_status: string
  }
  userId: string
}) {
  const router  = useRouter()
  const [stage, setStage]   = useState<Stage>('verify')
  const [method, setMethod] = useState<'phone' | 'email' | 'photo'>('phone')
  const [phone, setPhone]   = useState(biz.phone ?? '')
  const [code, setCode]     = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [pledge, setPledge] = useState(false)
  const [error, setError]   = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const category = CATEGORY_LABELS[biz.category as BusinessCategory] ?? biz.category

  async function sendCode() {
    setSending(true); setError('')
    try {
      const res = await fetch('/api/claim/send-code', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, businessId: biz.id }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Failed to send code') }
      setCodeSent(true)
    } catch (e: any) { setError(e.message) }
    finally { setSending(false) }
  }

  async function handleClaim() {
    if (!pledge) { setError('Please sign the honor pledge to continue.'); return }
    setVerifying(true); setError(''); setStage('submitting')

    try {
      const body: any = { businessId: biz.id, method, pledge }
      if (method === 'phone') body.phone = phone
      if (method === 'phone' && codeSent) body.code = code

      let photoUrl: string | null = null
      if (method === 'photo' && photoFile) {
        const fd = new FormData(); fd.append('file', photoFile); fd.append('businessId', biz.id)
        const uploadRes = await fetch('/api/claim/upload-proof', { method: 'POST', body: fd })
        if (!uploadRes.ok) throw new Error('Photo upload failed')
        const { url } = await uploadRes.json()
        photoUrl = url
        body.proofPhotoUrl = photoUrl
      }

      const res = await fetch('/api/claim/confirm', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Claim failed') }
      setStage('done')
    } catch (e: any) {
      setError(e.message); setStage('verify')
    } finally { setVerifying(false) }
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 'var(--radius)',
    border: '1px solid var(--rule)', fontSize: 14, color: 'var(--ink)',
    background: 'var(--surface-card)', fontFamily: 'var(--font-body)',
    outline: 'none',
  }

  const btn = (primary = false): React.CSSProperties => ({
    padding: '11px 22px', borderRadius: 'var(--radius-md)',
    fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
    fontFamily: 'var(--font-body)', letterSpacing: '0.02em',
    background: primary ? 'var(--gold)' : 'transparent',
    color: primary ? 'var(--forest)' : 'var(--ink-mid)',
    border: primary ? 'none' : '1px solid var(--rule)',
    transition: 'background 140ms, transform 80ms',
  })

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--surface)', fontFamily: 'var(--font-body)' }}>

      {/* Header */}
      <header style={{ background: 'var(--forest-mid)', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', borderBottom: '1px solid var(--rule-mid)', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 0 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.015em' }}>District</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gold)', letterSpacing: '0.08em', marginLeft: 6, position: 'relative', top: -1 }}>1921</span>
        </Link>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Claim your listing</span>
      </header>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '48px 24px' }}>

        {/* Business card */}
        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--rule)', borderRadius: 'var(--radius-lg)', padding: '20px 22px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', background: 'var(--surface)', border: '1px solid var(--rule)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--sage-light)', flexShrink: 0 }}>
            {biz.name[0]}
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--ink)', marginBottom: 3, letterSpacing: '-0.01em' }}>{biz.name}</p>
            <p style={{ fontSize: 12, color: 'var(--ink-mid)' }}>{category} · {biz.city}, {biz.state}</p>
          </div>
        </div>

        {/* VERIFY stage */}
        {stage === 'verify' && (
          <>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--ink)', marginBottom: 6, letterSpacing: '-0.01em' }}>
              Claim this listing
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ink-mid)', marginBottom: 28, lineHeight: 1.6 }}>
              Free to claim. We just need to confirm you're associated with this business.
            </p>

            {/* Verification method picker */}
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-mid)', marginBottom: 10, letterSpacing: '0.04em', textTransform: 'uppercase' }}>How would you like to verify?</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 24 }}>
              {[
                { id: 'phone' as const, label: 'Phone', desc: biz.phone ? 'Verify the number on file' : 'Enter your business phone' },
                { id: 'email' as const, label: 'Email domain', desc: 'Your email matches the business website' },
                { id: 'photo' as const, label: 'Proof photo', desc: 'Selfie at your business location' },
              ].map(m => (
                <button key={m.id} type="button" onClick={() => setMethod(m.id)} style={{
                  padding: '14px 12px', border: '1px solid', borderRadius: 'var(--radius-md)',
                  borderColor: method === m.id ? 'var(--gold)' : 'var(--rule)',
                  background: method === m.id ? 'var(--gold-faint)' : 'var(--surface-card)',
                  cursor: 'pointer', textAlign: 'left' as const,
                  transition: 'border-color 140ms, background 140ms',
                }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: method === m.id ? 'var(--shield-text)' : 'var(--ink)', marginBottom: 4 }}>{m.label}</p>
                  <p style={{ fontSize: 11, color: 'var(--ink-muted)', lineHeight: 1.4 }}>{m.desc}</p>
                </button>
              ))}
            </div>

            {/* Phone verification */}
            {method === 'phone' && (
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>Business Phone Number</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="tel" placeholder="(706) 555-0123" value={phone} onChange={e => setPhone(e.target.value)} style={{ ...inp, flex: 1 }} />
                  <button type="button" onClick={sendCode} disabled={!phone || sending} style={{ ...btn(true), whiteSpace: 'nowrap', opacity: !phone || sending ? 0.6 : 1 }}>
                    {sending ? 'Sending...' : codeSent ? 'Resend' : 'Send Code'}
                  </button>
                </div>
                {codeSent && (
                  <div style={{ marginTop: 10 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>Enter the 6-digit code</label>
                    <input type="text" inputMode="numeric" placeholder="000000" maxLength={6} value={code} onChange={e => setCode(e.target.value)} style={{ ...inp, letterSpacing: '0.3em', fontSize: 18 }} />
                  </div>
                )}
              </div>
            )}

            {/* Email domain */}
            {method === 'email' && (
              <div style={{ background: 'rgba(197,146,58,0.06)', border: '1px solid var(--shield-border)', borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: 24, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.65 }}>
                {biz.website
                  ? <>We'll verify that your login email domain matches <strong>{biz.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}</strong>. No extra steps required.</>
                  : <>This listing doesn't have a website on file. Choose phone or photo verification instead.</>
                }
              </div>
            )}

            {/* Proof photo */}
            {method === 'photo' && (
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>Upload a proof photo</label>
                <p style={{ fontSize: 12, color: 'var(--ink-mid)', marginBottom: 10, lineHeight: 1.6 }}>A selfie taken at or inside your business, with the business name visible. We'll review it within 24 hours.</p>
                <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files?.[0] ?? null)} style={{ ...inp, padding: '10px 14px', cursor: 'pointer' }} />
                {photoFile && <p style={{ fontSize: 12, color: 'var(--open-text)', marginTop: 6 }}>Photo selected: {photoFile.name}</p>}
              </div>
            )}

            {/* Honor pledge */}
            <div onClick={() => setPledge(!pledge)} style={{ background: pledge ? 'rgba(58,117,80,0.06)' : 'var(--surface-card)', border: `1px solid ${pledge ? 'var(--sage)' : 'var(--rule)'}`, borderRadius: 'var(--radius-md)', padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20, transition: 'border-color 140ms, background 140ms' }}>
              <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${pledge ? 'var(--sage)' : 'var(--rule-mid)'}`, background: pledge ? 'var(--sage)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, transition: 'all 140ms' }}>
                {pledge && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>Honor Pledge</p>
                <p style={{ fontSize: 12, color: 'var(--ink-mid)', lineHeight: 1.6 }}>I affirm this business is community-owned and operated. I will represent it honestly on District 1921.</p>
              </div>
            </div>

            {error && <p style={{ fontSize: 13, color: 'var(--closed-text)', marginBottom: 16, padding: '10px 14px', background: 'var(--closed-bg)', borderRadius: 'var(--radius)' }}>{error}</p>}

            <div style={{ display: 'flex', gap: 10 }}>
              <Link href={`/business/${biz.slug}`} style={{ ...btn(), textDecoration: 'none', display: 'inline-block' }}>Cancel</Link>
              <button type="button" onClick={handleClaim} disabled={!pledge || (method === 'phone' && codeSent && code.length < 6)} style={{ ...btn(true), flex: 1, opacity: (!pledge || (method === 'phone' && codeSent && code.length < 6)) ? 0.6 : 1 }}>
                Claim This Listing →
              </button>
            </div>

            <p style={{ fontSize: 11, color: 'var(--ink-muted)', textAlign: 'center', marginTop: 14, lineHeight: 1.65 }}>
              Free to claim. Upgrade to a Professional Page ($15/mo) anytime from your dashboard.
            </p>
          </>
        )}

        {/* SUBMITTING */}
        {stage === 'submitting' && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            <p style={{ fontSize: 15, color: 'var(--ink-mid)' }}>Processing your claim...</p>
          </div>
        )}

        {/* DONE */}
        {stage === 'done' && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--open-bg)', border: '1px solid rgba(94,203,138,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--open-text)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--ink)', marginBottom: 8, letterSpacing: '-0.01em' }}>
              {method === 'photo' ? 'Claim submitted' : 'Listing claimed!'}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--ink-mid)', marginBottom: 28, lineHeight: 1.7, maxWidth: 400, margin: '0 auto 28px' }}>
              {method === 'photo'
                ? "We'll review your proof photo within 24 hours and activate your listing. You can start setting up your profile now."
                : "Your free listing is now active. Head to your dashboard to add photos, hours, and more. Upgrade to Pro when you're ready."}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/dashboard" style={{ ...btn(true), textDecoration: 'none', display: 'inline-block' }}>Go to Dashboard →</Link>
              <Link href="/dashboard/billing" style={{ ...btn(), textDecoration: 'none', display: 'inline-block' }}>Upgrade to Pro</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
