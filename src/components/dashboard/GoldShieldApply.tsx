'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export function GoldShieldApply({ business, application }: { business: any; application: any }) {
  const [step, setStep] = useState<'info'|'upload'|'submitted'>(
    business.gold_shield ? 'submitted' : application?.status === 'pending' ? 'submitted' : 'info'
  )
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [proofUrl, setProofUrl] = useState(application?.proof_photo_url || '')
  const [checks, setChecks] = useState<any>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const s: React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const supabase = createClient()
    const path = `${business.id}/proof-${Date.now()}.${file.name.split('.').pop()}`
    const { data, error } = await supabase.storage.from('shield-proofs').upload(path, file, { upsert: true })
    if (!error && data) {
      const { data: { publicUrl } } = supabase.storage.from('shield-proofs').getPublicUrl(data.path)
      setProofUrl(publicUrl)
    }
    setUploading(false)
  }

  async function handleSubmit() {
    if (!proofUrl) return
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/shield/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId: business.id, proofPhotoUrl: proofUrl }),
    })
    const data = await res.json()
    if (res.ok) {
      setChecks(data.checks)
      setStep('submitted')
    } else {
      setError(data.error || 'Submission failed')
    }
    setSubmitting(false)
  }

  const goldBox = { background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 10, padding: '14px 18px', marginBottom: 12 }

  if (business.gold_shield) {
    return (
      <div className="max-w-xl">
        <div style={{ background: 'rgba(201,168,76,0.1)', border: '2px solid #c9a84c', borderRadius: 16, padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🛡</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 900, color: '#c9a84c', marginBottom: 8 }}>Gold Shield Verified</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Your business has passed all verification checks and carries the Gold Shield badge.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl text-[var(--color-gold)] mb-2">Gold Shield Verification</h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-6">
        The Gold Shield badge shows community members your business is legitimate and verified. One-time $25 fee — tied to your active subscription.
      </p>

      {step === 'info' && (
        <>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 mb-4">
            <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wide mb-4">What We Check</p>
            <div className="space-y-3">
              {[
                { icon: '🏛', label: 'Secretary of State Registration', desc: 'We look up your business registration in your state\'s SOS database', done: false },
                { icon: '📞', label: 'Phone Number Verified', desc: 'We confirm your business phone number is valid and active', done: business.phone_verified },
                { icon: '🌐', label: 'Website Reachable', desc: 'We verify your website is live and accessible', done: business.website_reachable },
                { icon: '📸', label: 'Proof Photo Reviewed', desc: 'You upload a selfie at/in your business — admin reviews within 24hrs', done: !!application?.proof_photo_url },
              ].map(c => (
                <div key={c.label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: c.done ? 'rgba(45,106,79,0.2)' : 'var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{c.done ? '✓' : c.icon}</div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text)]">{c.label}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => setStep('upload')}
            className="w-full py-3 bg-[var(--color-gold)] text-[var(--color-midnight)] font-bold rounded-lg text-sm hover:bg-[#dbb95a] transition-colors">
            Start Verification — $25 →
          </button>
        </>
      )}

      {step === 'upload' && (
        <>
          <div style={goldBox}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#c9a84c', marginBottom: 6 }}>Upload Your Proof Photo</p>
            <p style={{ fontSize: 12, color: '#A09D98', lineHeight: 1.6 }}>
              Take a photo of yourself at or inside your business with the business name clearly visible — on a sign, window, or business card. No filters.
            </p>
          </div>

          {proofUrl ? (
            <div style={{ marginBottom: 16 }}>
              <img src={proofUrl} alt="Proof" style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 10, border: '2px solid #c9a84c' }} />
              <button onClick={() => fileRef.current?.click()} style={{ marginTop: 8, fontSize: 12, color: '#A09D98', background: 'none', border: 'none', cursor: 'pointer', ...s }}>
                Change photo
              </button>
            </div>
          ) : (
            <div onClick={() => fileRef.current?.click()} style={{ border: '2px dashed var(--color-border)', borderRadius: 10, padding: '40px 20px', textAlign: 'center', cursor: 'pointer', marginBottom: 16, transition: 'border-color 0.2s' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4, ...s }}>{uploading ? 'Uploading...' : 'Click to upload proof photo'}</p>
              <p style={{ fontSize: 11, color: '#6B6B80', ...s }}>JPG, PNG, WebP · Max 10MB</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleUpload} />

          {/* Honor pledge */}
          <div style={{ ...goldBox, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ fontSize: 20 }}>🤝</div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#c9a84c', marginBottom: 2 }}>Honor Pledge</p>
              <p style={{ fontSize: 11, color: '#A09D98', lineHeight: 1.6 }}>By submitting, I affirm this business is community-owned and operated, and the information provided is accurate.</p>
            </div>
          </div>

          {error && <p style={{ color: '#ef9a9a', fontSize: 12, marginBottom: 12 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setStep('info')} style={{ flex: 1, padding: '12px', background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#A09D98', cursor: 'pointer', ...s }}>Back</button>
            <button onClick={handleSubmit} disabled={!proofUrl || submitting}
              style={{ flex: 2, padding: '12px', background: '#c9a84c', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, color: '#1a3a2a', cursor: !proofUrl || submitting ? 'not-allowed' : 'pointer', opacity: !proofUrl || submitting ? 0.6 : 1, ...s }}>
              {submitting ? 'Running checks...' : 'Submit for Review 🛡'}
            </button>
          </div>
        </>
      )}

      {step === 'submitted' && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 text-center">
          <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>Application Under Review</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">Your proof photo has been submitted. We review within 24 hours and will notify you by email.</p>
          {checks && (
            <div style={{ textAlign: 'left', background: 'var(--color-midnight)', borderRadius: 8, padding: '12px 16px', fontSize: 12 }}>
              <p style={{ fontWeight: 700, color: '#c9a84c', marginBottom: 8 }}>Automated Checks Complete</p>
              {[
                { label: 'Website Reachable', pass: checks.websiteReachable },
                { label: 'Phone Verified', pass: checks.phoneVerified },
              ].map(c => (
                <div key={c.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#A09D98' }}>{c.label}</span>
                  <span style={{ color: c.pass ? '#4CAF74' : '#ef9a9a', fontWeight: 700 }}>{c.pass ? '✓ Pass' : '✗ Fail'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
