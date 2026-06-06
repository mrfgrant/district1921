'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CATEGORY_LABELS, BusinessCategory, BusinessHours } from '@/types'
import { slugify } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormData {
  // Step 1 — Business basics
  name: string
  category: BusinessCategory | ''
  honor_pledge: boolean

  // Step 2 — Location
  is_mobile_service: boolean
  address: string
  city: string
  state: string
  zip: string

  // Step 3 — Contact & web (paid features, but collected upfront)
  phone: string
  website: string
  email: string

  // Step 4 — Description
  description: string

  // Step 5 — Hours
  hours: BusinessHours
}

const STEPS = [
  { id: 1, label: 'Business Info' },
  { id: 2, label: 'Location' },
  { id: 3, label: 'Contact' },
  { id: 4, label: 'About' },
  { id: 5, label: 'Hours' },
  { id: 6, label: 'Review' },
]

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as const
const DAY_LABELS: Record<string, string> = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
  thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
}

const EMPTY_HOURS: BusinessHours = {
  monday:    { open: '09:00', close: '17:00', closed: false },
  tuesday:   { open: '09:00', close: '17:00', closed: false },
  wednesday: { open: '09:00', close: '17:00', closed: false },
  thursday:  { open: '09:00', close: '17:00', closed: false },
  friday:    { open: '09:00', close: '17:00', closed: false },
  saturday:  { open: '10:00', close: '15:00', closed: false },
  sunday:    { open: '10:00', close: '15:00', closed: true  },
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OnboardingFlow({ userId, userEmail }: { userId: string; userEmail: string }) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<FormData>({
    name: '', category: '', honor_pledge: false,
    is_mobile_service: false, address: '', city: '', state: '', zip: '',
    phone: '', website: '', email: userEmail,
    description: '',
    hours: EMPTY_HOURS,
  })

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(f => ({ ...f, [key]: value }))
    setError(null)
  }

  function setHours(day: string, field: 'open' | 'close' | 'closed', value: string | boolean) {
    setForm(f => ({
      ...f,
      hours: {
        ...f.hours,
        [day]: { ...f.hours[day as keyof BusinessHours], [field]: value },
      },
    }))
  }

  function canAdvance(): boolean {
    if (step === 1) return !!form.name.trim() && !!form.category && form.honor_pledge
    if (step === 2) return !!form.city.trim() && !!form.state && (form.is_mobile_service || !!form.address.trim())
    if (step === 3) return true // contact optional
    if (step === 4) return form.description.trim().length >= 20
    if (step === 5) return true
    return true
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          slug: slugify(form.name) + '-' + Math.random().toString(36).slice(2, 6),
          owner_id: userId,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Submission failed')
      }
      router.push('/dashboard?submitted=1')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#faf7f0]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');
        .ob * { box-sizing: border-box; }
        .ob { font-family: 'DM Sans', sans-serif; }
        .ob-input {
          width: 100%; padding: 12px 16px;
          border: 1px solid #e5e0d5; border-radius: 6px;
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          color: #1c1c1c; background: #fff; outline: none;
          transition: border-color 0.15s;
        }
        .ob-input:focus { border-color: #2d6a4f; }
        .ob-input::placeholder { color: #b0a898; }
        .ob-label { display: block; font-size: 13px; font-weight: 600; color: #1c1c1c; margin-bottom: 6px; }
        .ob-sublabel { display: block; font-size: 12px; color: #6b7280; margin-bottom: 8px; margin-top: -2px; }
        .ob-field { margin-bottom: 20px; }
        .ob-select {
          width: 100%; padding: 12px 16px;
          border: 1px solid #e5e0d5; border-radius: 6px;
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          color: #1c1c1c; background: #fff; outline: none;
          cursor: pointer; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b7280' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 14px center;
        }
        .ob-select:focus { border-color: #2d6a4f; }
        .ob-cat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        @media(max-width: 540px) { .ob-cat-grid { grid-template-columns: 1fr; } }
        .ob-cat-btn {
          padding: 12px 14px; border: 1px solid #e5e0d5; border-radius: 8px;
          background: #fff; cursor: pointer; text-align: left;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
          color: #6b7280; transition: all 0.15s;
        }
        .ob-cat-btn:hover { border-color: #2d6a4f; color: #2d6a4f; background: #f0faf4; }
        .ob-cat-btn.selected { border-color: #1a3a2a; background: #1a3a2a; color: #fff; }
        .ob-toggle {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 16px; border: 1px solid #e5e0d5; border-radius: 8px;
          background: #fff; cursor: pointer; transition: all 0.15s; margin-bottom: 12px;
        }
        .ob-toggle:hover { border-color: #2d6a4f; }
        .ob-toggle.checked { border-color: #2d6a4f; background: #f0faf4; }
        .ob-toggle-box {
          width: 20px; height: 20px; border-radius: 4px;
          border: 2px solid #d8d0c4; background: #fff;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: all 0.15s;
        }
        .ob-toggle.checked .ob-toggle-box { border-color: #2d6a4f; background: #2d6a4f; }
        .ob-pledge {
          background: #d8f3dc; border: 1px solid #b8e0c4; border-left: 3px solid #2d6a4f;
          border-radius: 8px; padding: 16px 18px; margin-bottom: 20px; cursor: pointer;
          transition: all 0.15s;
        }
        .ob-pledge.checked { background: #f0faf4; border-left-color: #1a3a2a; }
        .ob-pledge-title { font-size: 14px; font-weight: 600; color: #1a3a2a; margin-bottom: 6px; display: flex; align-items: center; gap: 10px; }
        .ob-pledge-text { font-size: 13px; color: #2d6a4f; line-height: 1.65; }
        .ob-hours-row {
          display: grid; grid-template-columns: 100px 1fr 1fr 80px;
          gap: 8px; align-items: center; padding: 10px 0;
          border-bottom: 1px solid #f0ebe0;
        }
        .ob-hours-row:last-child { border-bottom: none; }
        .ob-day-label { font-size: 13px; font-weight: 600; color: #1c1c1c; }
        .ob-time-input {
          padding: 8px 10px; border: 1px solid #e5e0d5; border-radius: 6px;
          font-family: 'DM Sans', sans-serif; font-size: 13px;
          color: #1c1c1c; background: #fff; outline: none; width: 100%;
        }
        .ob-time-input:focus { border-color: #2d6a4f; }
        .ob-time-input:disabled { background: #f5f0e8; color: #b0a898; }
        .ob-closed-btn {
          padding: 7px 10px; border: 1px solid #e5e0d5; border-radius: 6px;
          font-size: 12px; font-weight: 500; cursor: pointer; text-align: center;
          transition: all 0.15s; background: #fff; color: #6b7280;
        }
        .ob-closed-btn.active { background: #fdecea; border-color: #f5c6c6; color: #c62828; }
        .ob-review-row {
          display: flex; justify-content: space-between; align-items: flex-start;
          padding: 12px 0; border-bottom: 1px solid #f0ebe0; gap: 16px;
        }
        .ob-review-row:last-child { border-bottom: none; }
        .ob-review-key { font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; flex-shrink: 0; width: 120px; }
        .ob-review-val { font-size: 14px; color: #1c1c1c; text-align: right; }
      `}</style>

      <div className="ob">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#1a3a2a] border-b border-[#2d6a4f]">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <span className="font-display text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              District <span className="text-[#c9a84c]">1921</span>
            </span>
            <span className="text-sm text-white/60">Set up your business</span>
          </div>
        </div>

        {/* Step progress */}
        <div className="bg-white border-b border-[#e5e0d5]">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center gap-0">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      step > s.id ? 'bg-[#2d6a4f] text-white' :
                      step === s.id ? 'bg-[#1a3a2a] text-white' :
                      'bg-[#f0ebe0] text-[#b0a898]'
                    }`}>
                      {step > s.id ? '✓' : s.id}
                    </div>
                    <span className={`text-xs mt-1 font-medium hidden sm:block ${step >= s.id ? 'text-[#1a3a2a]' : 'text-[#b0a898]'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-1 transition-all ${step > s.id ? 'bg-[#2d6a4f]' : 'bg-[#e5e0d5]'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form body */}
        <div className="max-w-2xl mx-auto px-4 py-8">

          {/* STEP 1 — Business Basics */}
          {step === 1 && (
            <div>
              <h1 className="text-2xl font-bold text-[#1a3a2a] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Tell us about your business
              </h1>
              <p className="text-[#6b7280] text-sm mb-8">This is how your business will appear in the directory.</p>

              <div className="ob-field">
                <label className="ob-label">Business Name</label>
                <input
                  className="ob-input"
                  type="text"
                  placeholder="e.g. Mama's Southern Kitchen"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  maxLength={100}
                  autoFocus
                />
                {form.name && (
                  <p className="text-xs text-[#8a7a5a] mt-2">
                    Your listing will appear at: <span className="font-mono text-[#2d6a4f]">district1921.com/business/{slugify(form.name) || '...'}</span>
                  </p>
                )}
              </div>

              <div className="ob-field">
                <label className="ob-label">Category</label>
                <span className="ob-sublabel">Choose the category that best describes your business.</span>
                <div className="ob-cat-grid">
                  {(Object.entries(CATEGORY_LABELS) as [BusinessCategory, string][]).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      className={`ob-cat-btn ${form.category === value ? 'selected' : ''}`}
                      onClick={() => set('category', value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className={`ob-pledge ${form.honor_pledge ? 'checked' : ''}`}
                onClick={() => set('honor_pledge', !form.honor_pledge)}
              >
                <div className="ob-pledge-title">
                  <div className={`ob-toggle-box ${form.honor_pledge ? 'checked' : ''}`}>
                    {form.honor_pledge && <span style={{ color: '#fff', fontSize: '11px', fontWeight: 700 }}>✓</span>}
                  </div>
                  Honor Pledge
                </div>
                <div className="ob-pledge-text">
                  I affirm that this business is community-owned and operated. I understand that District 1921 is built on trust, and I will represent my business honestly.
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — Location */}
          {step === 2 && (
            <div>
              <h1 className="text-2xl font-bold text-[#1a3a2a] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Where are you located?
              </h1>
              <p className="text-[#6b7280] text-sm mb-8">Help customers find you. Mobile businesses only need city and state.</p>

              <div
                className={`ob-toggle ${form.is_mobile_service ? 'checked' : ''}`}
                onClick={() => set('is_mobile_service', !form.is_mobile_service)}
              >
                <div className={`ob-toggle-box ${form.is_mobile_service ? 'checked' : ''}`}>
                  {form.is_mobile_service && <span style={{ color: '#fff', fontSize: '11px', fontWeight: 700 }}>✓</span>}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#1c1c1c]">📱 I offer mobile or on-site services</div>
                  <div className="text-xs text-[#6b7280] mt-0.5">I come to my customers. No fixed storefront address required.</div>
                </div>
              </div>

              {!form.is_mobile_service && (
                <div className="ob-field">
                  <label className="ob-label">Street Address</label>
                  <input
                    className="ob-input"
                    type="text"
                    placeholder="1842 Broad St"
                    value={form.address}
                    onChange={e => set('address', e.target.value)}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="ob-field">
                  <label className="ob-label">City <span className="text-[#c62828]">*</span></label>
                  <input
                    className="ob-input"
                    type="text"
                    placeholder="Augusta"
                    value={form.city}
                    onChange={e => set('city', e.target.value)}
                  />
                </div>
                <div className="ob-field">
                  <label className="ob-label">State <span className="text-[#c62828]">*</span></label>
                  <select className="ob-select" value={form.state} onChange={e => set('state', e.target.value)}>
                    <option value="">Select state</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {!form.is_mobile_service && (
                <div className="ob-field" style={{ width: '50%' }}>
                  <label className="ob-label">ZIP Code</label>
                  <input
                    className="ob-input"
                    type="text"
                    placeholder="30901"
                    value={form.zip}
                    onChange={e => set('zip', e.target.value)}
                    maxLength={10}
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 3 — Contact */}
          {step === 3 && (
            <div>
              <h1 className="text-2xl font-bold text-[#1a3a2a] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                How can customers reach you?
              </h1>
              <p className="text-[#6b7280] text-sm mb-2">All fields optional for now — you can add these anytime in your dashboard.</p>
              <div className="bg-[#f5e6c0] border border-[#e8d090] rounded-lg px-4 py-3 mb-8 text-sm text-[#5a4a20]">
                📋 Contact info is only visible on <strong>Professional Pages</strong> ($15/mo). Free listings show name, category, and city only.
              </div>

              <div className="ob-field">
                <label className="ob-label">Phone Number</label>
                <input
                  className="ob-input"
                  type="tel"
                  placeholder="(706) 555-0182"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                />
              </div>

              <div className="ob-field">
                <label className="ob-label">Website</label>
                <input
                  className="ob-input"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={form.website}
                  onChange={e => set('website', e.target.value)}
                />
              </div>

              <div className="ob-field">
                <label className="ob-label">Business Email</label>
                <span className="ob-sublabel">For customer contact — separate from your login email if needed.</span>
                <input
                  className="ob-input"
                  type="email"
                  placeholder="hello@yourbusiness.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* STEP 4 — Description */}
          {step === 4 && (
            <div>
              <h1 className="text-2xl font-bold text-[#1a3a2a] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Tell your story
              </h1>
              <p className="text-[#6b7280] text-sm mb-8">This appears on your business page. Write naturally — tell people who you are and what makes you different.</p>

              <div className="ob-field">
                <label className="ob-label">Business Description</label>
                <span className="ob-sublabel">At least 20 characters. Be specific — what do you offer, who do you serve, what's your story?</span>
                <textarea
                  className="ob-input"
                  rows={7}
                  placeholder="e.g. We've been serving Augusta since 1987, specializing in authentic Southern cuisine made from scratch daily. Founded by Dorothy 'Mama' Williams, our recipes have been passed down through four generations..."
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  style={{ resize: 'vertical', lineHeight: '1.65' }}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-[#6b7280]">
                    {form.description.length < 20
                      ? `${20 - form.description.length} more characters needed`
                      : '✓ Looks good'}
                  </span>
                  <span className="text-xs text-[#6b7280]">{form.description.length} / 2000</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5 — Hours */}
          {step === 5 && (
            <div>
              <h1 className="text-2xl font-bold text-[#1a3a2a] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                What are your hours?
              </h1>
              <p className="text-[#6b7280] text-sm mb-8">You can update these anytime. Check "Closed" for days you're not open.</p>

              <div className="bg-white border border-[#e5e0d5] rounded-12 overflow-hidden" style={{ borderRadius: '12px' }}>
                <div className="px-5 py-4">
                  {DAYS.map(day => {
                    const h = form.hours[day] ?? { open: '09:00', close: '17:00', closed: false }
                    return (
                      <div key={day} className="ob-hours-row">
                        <span className="ob-day-label">{DAY_LABELS[day]}</span>
                        <input
                          type="time"
                          className="ob-time-input"
                          value={h.open}
                          disabled={h.closed}
                          onChange={e => setHours(day, 'open', e.target.value)}
                        />
                        <input
                          type="time"
                          className="ob-time-input"
                          value={h.close}
                          disabled={h.closed}
                          onChange={e => setHours(day, 'close', e.target.value)}
                        />
                        <button
                          type="button"
                          className={`ob-closed-btn ${h.closed ? 'active' : ''}`}
                          onClick={() => setHours(day, 'closed', !h.closed)}
                        >
                          {h.closed ? 'Closed' : 'Open'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6 — Review */}
          {step === 6 && (
            <div>
              <h1 className="text-2xl font-bold text-[#1a3a2a] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Review & submit
              </h1>
              <p className="text-[#6b7280] text-sm mb-8">
                Once submitted, your listing goes into our review queue. We'll approve it within 24–48 hours and notify you by email.
              </p>

              <div className="bg-white border border-[#e5e0d5] rounded-xl overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-[#e5e0d5] flex justify-between items-center">
                  <span className="font-semibold text-[#1a3a2a]">{form.name}</span>
                  <button onClick={() => setStep(1)} className="text-xs text-[#2d6a4f] underline">Edit</button>
                </div>
                <div className="px-6 py-2">
                  <div className="ob-review-row">
                    <span className="ob-review-key">Category</span>
                    <span className="ob-review-val">{form.category ? CATEGORY_LABELS[form.category as BusinessCategory] : '—'}</span>
                  </div>
                  <div className="ob-review-row">
                    <span className="ob-review-key">Location</span>
                    <span className="ob-review-val">
                      {form.is_mobile_service ? '📱 Mobile service — ' : ''}
                      {[form.address, form.city, form.state, form.zip].filter(Boolean).join(', ') || '—'}
                    </span>
                  </div>
                  <div className="ob-review-row">
                    <span className="ob-review-key">Phone</span>
                    <span className="ob-review-val">{form.phone || <span className="text-[#b0a898]">Not provided</span>}</span>
                  </div>
                  <div className="ob-review-row">
                    <span className="ob-review-key">Website</span>
                    <span className="ob-review-val">{form.website || <span className="text-[#b0a898]">Not provided</span>}</span>
                  </div>
                  <div className="ob-review-row">
                    <span className="ob-review-key">Email</span>
                    <span className="ob-review-val">{form.email || <span className="text-[#b0a898]">Not provided</span>}</span>
                  </div>
                  <div className="ob-review-row">
                    <span className="ob-review-key">Description</span>
                    <span className="ob-review-val text-left text-sm text-[#6b7280]" style={{ textAlign: 'left', maxWidth: '60%' }}>
                      {form.description.slice(0, 120)}{form.description.length > 120 ? '…' : ''}
                    </span>
                  </div>
                  <div className="ob-review-row">
                    <span className="ob-review-key">Honor Pledge</span>
                    <span className="ob-review-val text-[#2d6a4f] font-semibold">✓ Signed</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#d8f3dc] border border-[#b8e0c4] rounded-xl px-5 py-4 mb-6 text-sm text-[#1a3a2a]">
                <p className="font-semibold mb-1">What happens next:</p>
                <ul className="space-y-1 text-[#2d6a4f]">
                  <li>→ Your listing enters our review queue (24–48 hrs)</li>
                  <li>→ Once approved, it appears in search results immediately</li>
                  <li>→ Upgrade to a Professional Page anytime from your dashboard</li>
                  <li>→ Apply for Gold Shield verification when you're ready</li>
                </ul>
              </div>

              {error && (
                <div className="bg-[#fdecea] border border-[#f5c6c6] rounded-lg px-4 py-3 mb-4 text-sm text-[#c62828]">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-[#e5e0d5]">
            <button
              type="button"
              onClick={() => setStep(s => Math.max(1, s - 1))}
              className={`px-6 py-3 rounded-lg text-sm font-semibold border border-[#e5e0d5] text-[#6b7280] bg-white hover:border-[#2d6a4f] hover:text-[#2d6a4f] transition-colors ${step === 1 ? 'invisible' : ''}`}
            >
              ← Back
            </button>

            {step < STEPS.length ? (
              <button
                type="button"
                onClick={() => { if (canAdvance()) setStep(s => s + 1) }}
                disabled={!canAdvance()}
                className="px-8 py-3 rounded-lg text-sm font-semibold bg-[#1a3a2a] text-white hover:bg-[#2d6a4f] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 rounded-lg text-sm font-semibold bg-[#c9a84c] text-[#1a3a2a] hover:bg-[#dbb95a] transition-colors disabled:opacity-50"
              >
                {loading ? 'Submitting…' : 'Submit for Review →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
