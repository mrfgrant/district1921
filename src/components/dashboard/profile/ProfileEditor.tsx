'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CATEGORY_LABELS, BusinessCategory } from '@/types'

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as const
const DAY_LABELS: Record<string,string> = {
  monday:'Monday',tuesday:'Tuesday',wednesday:'Wednesday',
  thursday:'Thursday',friday:'Friday',saturday:'Saturday',sunday:'Sunday',
}

const TABS = ['Basic Info','Contact','Hours','Photos','Preview'] as const
type Tab = typeof TABS[number]

export function ProfileEditor({ business: initial }: { business: any }) {
  const [tab, setTab] = useState<Tab>('Basic Info')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const photosInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: initial.name ?? '',
    description: initial.description ?? '',
    phone: initial.phone ?? '',
    website: initial.website ?? '',
    email: initial.email ?? '',
    address: initial.address ?? '',
    suite: initial.suite ?? '',
    city: initial.city ?? '',
    state: initial.state ?? '',
    zip: initial.zip ?? '',
    is_mobile_service: initial.is_mobile_service ?? false,
    service_area: (initial.service_area ?? 'local') as 'local'|'statewide'|'nationwide'|'online',
    logo_url: initial.logo_url ?? '',
    cover_photo_url: initial.cover_photo_url ?? '',
    photos: (initial.photos ?? []) as string[],
    hours: initial.hours ?? {
      monday:{open:'09:00',close:'17:00',closed:false},
      tuesday:{open:'09:00',close:'17:00',closed:false},
      wednesday:{open:'09:00',close:'17:00',closed:false},
      thursday:{open:'09:00',close:'17:00',closed:false},
      friday:{open:'09:00',close:'17:00',closed:false},
      saturday:{open:'10:00',close:'15:00',closed:false},
      sunday:{open:'10:00',close:'15:00',closed:true},
    },
  })

  const isPro = initial.subscription_status === 'active'
  const isAdmin = initial.subscription_status === 'active' // admins also have active

  function set<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm(f => ({ ...f, [key]: val }))
    setSaved(false)
  }

  function setHours(day: string, field: string, val: string | boolean) {
    setForm(f => ({ ...f, hours: { ...f.hours, [day]: { ...f.hours[day], [field]: val } } }))
    setSaved(false)
  }

  async function uploadImage(file: File, bucket: string, path: string): Promise<string | null> {
    const supabase = createClient()
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true, contentType: file.type })

    if (error) { console.error('Upload error:', error); return null }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path)
    return publicUrl
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    const url = await uploadImage(file, 'business-logos', `${initial.id}/logo-${Date.now()}.${file.name.split('.').pop()}`)
    if (url) set('logo_url', url)
    setUploadingLogo(false)
  }

  async function handlePhotosUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploadingPhotos(true)
    const urls: string[] = []
    for (const file of files.slice(0, 8 - form.photos.length)) {
      const url = await uploadImage(file, 'business-photos', `${initial.id}/photo-${Date.now()}-${Math.random().toString(36).slice(2)}.${file.name.split('.').pop()}`)
      if (url) urls.push(url)
    }
    if (urls.length) set('photos', [...form.photos, ...urls])
    setUploadingPhotos(false)
  }

  async function handleSave() {
    setSaving(true)
    const res = await fetch('/api/dashboard/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) setSaved(true)
    setSaving(false)
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    border: '1.5px solid #2A2A35', borderRadius: 6,
    background: '#1C1C23', color: '#F0EDE8',
    fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: 'none',
    transition: 'border-color 0.15s',
  }
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#A09D98', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }
  const fieldStyle = { marginBottom: 20 }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl text-[var(--color-gold)]">{initial.name}</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Profile completion: <span className="font-semibold text-[var(--color-text)]">{initial.profile_completion}%</span>
          </p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="px-6 py-2.5 bg-[var(--color-gold)] text-[var(--color-midnight)] text-sm font-bold rounded-lg disabled:opacity-50 hover:bg-[#dbb95a] transition-colors">
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>

      {/* Progress bar */}
      <div className="bg-[var(--color-border)] h-1.5 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-[var(--color-gold)] rounded-full transition-all" style={{ width: `${initial.profile_completion}%` }} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-1 mb-6 flex-wrap">
        {TABS.map(t => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
              tab === t ? 'bg-[var(--color-gold)] text-[var(--color-midnight)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── BASIC INFO ── */}
      {tab === 'Basic Info' && (
        <div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Business Name</label>
            <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)}
              onFocus={e => (e.target.style.borderColor = '#C9A84C')}
              onBlur={e => (e.target.style.borderColor = '#2A2A35')} />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Category</label>
            <div style={{ fontSize: 13, color: '#A09D98', padding: '11px 14px', background: '#1C1C23', border: '1.5px solid #2A2A35', borderRadius: 6 }}>
              {CATEGORY_LABELS[initial.category as BusinessCategory] ?? initial.category}
              <span style={{ marginLeft: 8, fontSize: 11, color: '#6B6B80' }}>(contact support to change)</span>
            </div>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Description</label>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: '#6B6B80' }}>{form.description.length} / 2000</span>
            </div>
            <textarea
              rows={6}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.65' }}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              onFocus={e => (e.target.style.borderColor = '#C9A84C')}
              onBlur={e => (e.target.style.borderColor = '#2A2A35')}
              maxLength={2000}
              placeholder="Tell your story — who you are, what you offer, what makes you different."
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Service Type</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {([
                { val: false, label: '🏪 Storefront' },
                { val: true, label: '📱 Mobile / On-site' },
              ]).map(opt => (
                <button key={String(opt.val)} type="button"
                  onClick={() => set('is_mobile_service', opt.val)}
                  style={{
                    flex: 1, padding: '11px', border: '1.5px solid',
                    borderColor: form.is_mobile_service === opt.val ? '#C9A84C' : '#2A2A35',
                    borderRadius: 8, background: form.is_mobile_service === opt.val ? 'rgba(201,168,76,0.1)' : '#1C1C23',
                    color: form.is_mobile_service === opt.val ? '#C9A84C' : '#A09D98',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Service Area</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {([
                { val: 'local', icon: '📍', title: 'Local', desc: 'My city & area' },
                { val: 'statewide', icon: '🗺', title: 'Statewide', desc: 'Anywhere in my state' },
                { val: 'nationwide', icon: '🇺🇸', title: 'Nationwide', desc: 'Serving all of the US' },
                { val: 'online', icon: '💻', title: 'Online / Virtual', desc: 'Fully online, no location' },
              ] as { val: 'local'|'statewide'|'nationwide'|'online'; icon: string; title: string; desc: string }[]).map(o => (
                <button key={o.val} type="button" onClick={() => set('service_area', o.val)}
                  style={{
                    border: `1.5px solid ${form.service_area === o.val ? '#C9A84C' : '#2A2A35'}`,
                    borderRadius: 8, padding: '12px 14px', cursor: 'pointer', textAlign: 'left',
                    background: form.service_area === o.val ? 'rgba(201,168,76,0.08)' : '#1C1C23',
                    transition: 'all 0.15s',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 18 }}>{o.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: form.service_area === o.val ? '#C9A84C' : '#F0EDE8' }}>{o.title}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#6B6B80', lineHeight: 1.4 }}>{o.desc}</div>
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ── CONTACT ── */}
      {tab === 'Contact' && (
        <div>
          {!isPro && (
            <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)', borderLeft: '3px solid #C9A84C', borderRadius: 8, padding: '14px 18px', marginBottom: 24, fontSize: 13, color: '#C9A84C', lineHeight: 1.6 }}>
              Contact info is only visible on <strong>Professional Pages</strong>. Upgrade to $15/mo to show your phone, website, and email to visitors.
            </div>
          )}
          {[
            { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '(706) 555-0182' },
            { key: 'website', label: 'Website', type: 'url', placeholder: 'https://yourwebsite.com' },
            { key: 'email', label: 'Business Email', type: 'email', placeholder: 'hello@yourbusiness.com' },
          ].map(f => (
            <div key={f.key} style={fieldStyle}>
              <label style={labelStyle}>{f.label}</label>
              <input
                style={inputStyle} type={f.type} placeholder={f.placeholder}
                value={(form as any)[f.key]}
                onChange={e => set(f.key as any, e.target.value)}
                onFocus={e => (e.target.style.borderColor = '#C9A84C')}
                onBlur={e => (e.target.style.borderColor = '#2A2A35')}
              />
            </div>
          ))}
          <div style={fieldStyle}>
            <label style={labelStyle}>Street Address</label>
            <input style={inputStyle} placeholder="1842 Broad St" value={form.address} onChange={e => set('address', e.target.value)}
              onFocus={e => (e.target.style.borderColor = '#C9A84C')} onBlur={e => (e.target.style.borderColor = '#2A2A35')} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Suite / Unit <span style={{ color: '#6B6B80', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <input style={inputStyle} placeholder="Suite 200" value={form.suite} onChange={e => set('suite', e.target.value)}
              onFocus={e => (e.target.style.borderColor = '#C9A84C')} onBlur={e => (e.target.style.borderColor = '#2A2A35')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 120px', gap: 12 }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>City</label>
              <input style={inputStyle} value={form.city} onChange={e => set('city', e.target.value)}
                onFocus={e => (e.target.style.borderColor = '#C9A84C')} onBlur={e => (e.target.style.borderColor = '#2A2A35')} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>State</label>
              <input style={inputStyle} maxLength={2} value={form.state} onChange={e => set('state', e.target.value.toUpperCase())}
                onFocus={e => (e.target.style.borderColor = '#C9A84C')} onBlur={e => (e.target.style.borderColor = '#2A2A35')} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>ZIP</label>
              <input style={inputStyle} value={form.zip} onChange={e => set('zip', e.target.value)}
                onFocus={e => (e.target.style.borderColor = '#C9A84C')} onBlur={e => (e.target.style.borderColor = '#2A2A35')} />
            </div>
          </div>
        </div>
      )}

      {/* ── HOURS ── */}
      {tab === 'Hours' && (
        <div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
            <div className="p-5">
              {DAYS.map(day => {
                const h = form.hours[day] ?? { open: '09:00', close: '17:00', closed: false }
                return (
                  <div key={day} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1fr 90px', gap: 8, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #2A2A35' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: h.closed ? '#6B6B80' : '#F0EDE8' }}>{DAY_LABELS[day]}</span>
                    <input type="time" disabled={h.closed} value={h.open} onChange={e => setHours(day, 'open', e.target.value)}
                      style={{ ...inputStyle, padding: '8px 10px', fontSize: 13, opacity: h.closed ? 0.4 : 1 }} />
                    <input type="time" disabled={h.closed} value={h.close} onChange={e => setHours(day, 'close', e.target.value)}
                      style={{ ...inputStyle, padding: '8px 10px', fontSize: 13, opacity: h.closed ? 0.4 : 1 }} />
                    <button type="button" onClick={() => setHours(day, 'closed', !h.closed)}
                      style={{
                        padding: '8px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1.5px solid',
                        borderColor: h.closed ? '#c62828' : '#2A2A35',
                        background: h.closed ? 'rgba(198,40,40,0.15)' : '#1C1C23',
                        color: h.closed ? '#ef9a9a' : '#A09D98',
                      }}>
                      {h.closed ? 'Closed' : 'Open'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── PHOTOS ── */}
      {tab === 'Photos' && (
        <div>
          {/* Logo */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Logo</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 80, height: 80, borderRadius: 12, flexShrink: 0,
                background: form.logo_url ? `url(${form.logo_url}) center/cover` : '#2A2A35',
                border: '2px solid #2A2A35', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, color: '#6B6B80',
              }}>
                {!form.logo_url && '🏪'}
              </div>
              <div>
                <button type="button" onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  style={{ padding: '9px 18px', background: '#C9A84C', color: '#141418', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 6, display: 'block' }}>
                  {uploadingLogo ? 'Uploading…' : form.logo_url ? 'Change Logo' : 'Upload Logo'}
                </button>
                <span style={{ fontSize: 11, color: '#6B6B80' }}>JPG, PNG, or WebP · Max 5MB</span>
                <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleLogoUpload} />
              </div>
            </div>
          </div>

          {/* Photos */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Photos <span style={{ color: '#6B6B80', textTransform: 'none', letterSpacing: 0 }}>({form.photos.length}/8)</span></label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
              {form.photos.map((url, i) => (
                <div key={url} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', background: '#1C1C23' }}>
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button"
                    onClick={() => set('photos', form.photos.filter((_, j) => j !== i))}
                    style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    ×
                  </button>
                </div>
              ))}
              {form.photos.length < 8 && (
                <button type="button" onClick={() => photosInputRef.current?.click()}
                  disabled={uploadingPhotos}
                  style={{ aspectRatio: '1', borderRadius: 8, border: '2px dashed #2A2A35', background: '#1C1C23', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6B6B80', fontSize: 11, gap: 4 }}>
                  <span style={{ fontSize: 20 }}>{uploadingPhotos ? '⏳' : '+'}</span>
                  {uploadingPhotos ? 'Uploading…' : 'Add Photo'}
                </button>
              )}
            </div>
            <input ref={photosInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: 'none' }} onChange={handlePhotosUpload} />
            <span style={{ fontSize: 11, color: '#6B6B80' }}>JPG, PNG, or WebP · Max 10MB each · Up to 8 photos</span>
          </div>
        </div>
      )}

      {/* ── PREVIEW ── */}
      {tab === 'Preview' && (
        <div>
          <div style={{ background: '#1a3a2a', borderRadius: '12px 12px 0 0', height: 120, position: 'relative',
            backgroundImage: form.cover_photo_url ? `url(${form.cover_photo_url})` : undefined,
            backgroundSize: 'cover', backgroundPosition: 'center',
          }}>
            <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', alignItems: 'flex-end', gap: 14 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 10, border: '2px solid #fff',
                background: form.logo_url ? `url(${form.logo_url}) center/cover` : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, fontWeight: 700, color: '#2d6a4f',
                fontFamily: "'Playfair Display', serif",
              }}>
                {!form.logo_url && (form.name[0] ?? '?')}
              </div>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 900, color: '#fff' }}>{form.name}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{CATEGORY_LABELS[initial.category as BusinessCategory]} · {form.city}, {form.state}</div>
              </div>
            </div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e5e0d5', borderRadius: '0 0 12px 12px', padding: 20 }}>
            {form.description ? (
              <p style={{ fontSize: 14, lineHeight: 1.7, color: '#4a4540' }}>{form.description}</p>
            ) : (
              <p style={{ fontSize: 13, color: '#b0a898', fontStyle: 'italic' }}>No description yet — add one in Basic Info.</p>
            )}
          </div>
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <a href={`/business/${initial.slug}`} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 13, color: '#C9A84C', textDecoration: 'underline', textUnderlineOffset: 2 }}>
              View live listing ↗
            </a>
          </div>
        </div>
      )}

      {/* Save button bottom */}
      <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #2A2A35', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        {saved && <span style={{ fontSize: 13, color: '#4CAF74', alignSelf: 'center' }}>✓ Changes saved</span>}
        <button onClick={handleSave} disabled={saving}
          style={{ padding: '12px 28px', background: '#C9A84C', color: '#141418', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
