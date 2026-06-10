'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { CATEGORY_LABELS, BusinessCategory, BusinessHours } from '@/types'
import { slugify } from '@/lib/utils'

type ServiceType = 'storefront' | 'mobile_only' | 'both'
interface FormData {
  name: string; category: BusinessCategory | ''; honor_pledge: boolean
  service_type: ServiceType; service_area: 'local'|'statewide'|'nationwide'|'online'
  address: string; suite: string
  city: string; state: string; zip: string
  phone: string; website: string; email: string
  description: string; hours: BusinessHours
}
const STEPS = [
  { id: 1, label: 'Business Info' },{ id: 2, label: 'Location' },
  { id: 3, label: 'Contact' },{ id: 4, label: 'About' },
  { id: 5, label: 'Hours' },{ id: 6, label: 'Review' },
]
const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC']
const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as const
const DAY_LABELS: Record<string,string> = { monday:'Monday',tuesday:'Tuesday',wednesday:'Wednesday',thursday:'Thursday',friday:'Friday',saturday:'Saturday',sunday:'Sunday' }
const EMPTY_HOURS: BusinessHours = {
  monday:{open:'09:00',close:'17:00',closed:false},tuesday:{open:'09:00',close:'17:00',closed:false},
  wednesday:{open:'09:00',close:'17:00',closed:false},thursday:{open:'09:00',close:'17:00',closed:false},
  friday:{open:'09:00',close:'17:00',closed:false},saturday:{open:'10:00',close:'15:00',closed:false},
  sunday:{open:'10:00',close:'15:00',closed:true},
}

function AddressAutocomplete({ value, onChange, onPlaceSelect }: {
  value: string; onChange: (v: string) => void
  onPlaceSelect: (p: { address: string; city: string; state: string; zip: string }) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const acRef = useRef<google.maps.places.Autocomplete | null>(null)
  const onPlaceSelectRef = useRef(onPlaceSelect)
  useEffect(() => { onPlaceSelectRef.current = onPlaceSelect }, [onPlaceSelect])

  useEffect(() => {
    if (!inputRef.current || !window.google?.maps?.places) return
    acRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'], componentRestrictions: { country: 'us' },
      fields: ['address_components'],
    })
    acRef.current.addListener('place_changed', () => {
      const place = acRef.current!.getPlace()
      if (!place.address_components) return
      let num='',route='',city='',state='',zip=''
      for (const c of place.address_components) {
        if (c.types.includes('street_number')) num = c.long_name
        if (c.types.includes('route')) route = c.long_name
        if (c.types.includes('locality')) city = c.long_name
        if (c.types.includes('administrative_area_level_1')) state = c.short_name
        if (c.types.includes('postal_code')) zip = c.long_name
      }
      const address = [num,route].filter(Boolean).join(' ')
      onChange(address)
      onPlaceSelectRef.current({ address, city, state, zip })
    })
  }, [onChange])

  return (
    <input ref={inputRef} type="text" className="ob-input"
      placeholder="Start typing your street address..." value={value}
      onChange={e => onChange(e.target.value)} autoComplete="off" />
  )
}

export function OnboardingFlow({ userId, userEmail, isAdmin }: {
  userId: string; userEmail: string; isAdmin?: boolean
}) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [cleaning, setCleaning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mapsLoaded, setMapsLoaded] = useState(false)

  const [form, setForm] = useState<FormData>({
    name:'', category:'', honor_pledge:false, service_type:'storefront',
    address:'', suite:'', city:'', state:'', zip:'',
    phone:'', website:'', email:userEmail, description:'', hours:EMPTY_HOURS,
  })

  useEffect(() => {
    if ((window as any).google?.maps?.places) { setMapsLoaded(true); return }
    const s = document.createElement('script')
    s.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
    s.async = true; s.onload = () => setMapsLoaded(true)
    document.head.appendChild(s)
  }, [])

  const setField = <K extends keyof FormData>(key: K, val: FormData[K]) => {
    setForm(f => ({ ...f, [key]: val })); setError(null)
  }
  const setHours = (day: string, field: 'open'|'close'|'closed', val: string|boolean) =>
    setForm(f => ({ ...f, hours: { ...f.hours, [day]: { ...f.hours[day as keyof BusinessHours], [field]: val } } }))

  const handleAddressChange = useCallback((v: string) => setField('address', v), [])
  const handlePlaceSelect = useCallback(({ address, city, state, zip }: { address: string; city: string; state: string; zip: string }) => {
    setForm(f => ({ ...f, address, city, state, zip }))
  }, [])

  const needsAddress = form.service_type !== 'mobile_only'

  function canAdvance() {
    if (step === 1) return !!form.name.trim() && !!form.category && form.honor_pledge
    if (step === 2) return needsAddress ? (!!form.address && !!form.city && !!form.state) : (!!form.city && !!form.state)
    if (step === 4) return form.description.trim().length >= 20
    return true
  }

  async function cleanWithAI() {
    if (form.description.trim().length < 20) return
    setCleaning(true)
    try {
      const res = await fetch('/api/ai/clean-description', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: form.description, businessName: form.name }),
      })
      if (res.ok) { const { cleaned } = await res.json(); setField('description', cleaned) }
    } finally { setCleaning(false) }
  }

  async function handleSubmit() {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/businesses', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form, is_mobile_service: form.service_type !== 'storefront', service_area: form.service_area,
          slug: slugify(form.name) + '-' + Math.random().toString(36).slice(2,6),
          owner_id: userId, is_admin: isAdmin,
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Submission failed') }
      router.push('/dashboard?submitted=1')
    } catch (err) { setError(err instanceof Error ? err.message : 'Something went wrong') }
    finally { setLoading(false) }
  }

  const S: React.CSSProperties = { fontFamily: "'Playfair Display', serif" }

  return (
    <div style={{ minHeight:"100dvh", background:"var(--surface)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');
        .ob,.ob *{box-sizing:border-box;font-family:'DM Sans',sans-serif}
        .ob-input{width:100%;padding:12px 16px;border:1.5px solid #d4cfc7;border-radius:6px;font-size:14px;color:#1c1c1c;background:#fff;outline:none;transition:border-color 0.15s,box-shadow 0.15s;display:block}
        .ob-input:focus{border-color:#2d6a4f;box-shadow:0 0 0 3px rgba(45,106,79,0.1)}
        .ob-input::placeholder{color:#b0a898}
        .ob-label{display:block;font-size:13px;font-weight:600;color:#1c1c1c;margin-bottom:6px}
        .ob-sublabel{display:block;font-size:12px;color:#6b7280;margin-bottom:8px;margin-top:-2px}
        .ob-field{margin-bottom:20px}
        .ob-select{width:100%;padding:12px 16px;border:1.5px solid #d4cfc7;border-radius:6px;font-size:14px;color:#1c1c1c;background:#fff;outline:none;cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b7280' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center}
        .ob-select:focus{border-color:#2d6a4f}
        .ob-cat-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
        .ob-cat-btn{padding:13px 16px;border:1.5px solid #d4cfc7;border-radius:8px;background:#fff;cursor:pointer;text-align:left;font-size:13px;font-weight:500;color:#6b7280;transition:all 0.15s}
        .ob-cat-btn:hover{border-color:#2d6a4f;color:#2d6a4f;background:#f0faf4}
        .ob-cat-btn.selected{border-color:#1a3a2a;background:#1a3a2a;color:#fff;font-weight:600}
        .ob-svc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:24px}
        .ob-svc{border:1.5px solid #d4cfc7;border-radius:10px;padding:18px 12px;cursor:pointer;transition:all 0.15s;background:#fff;text-align:center}
        .ob-svc:hover{border-color:#2d6a4f;background:#f8fdf9}
        .ob-svc.sel{border-color:#1a3a2a;background:#f0faf4}
        .ob-svc .si{font-size:26px;margin-bottom:8px}
        .ob-svc .st{font-size:13px;font-weight:700;color:#1c1c1c;margin-bottom:4px}
        .ob-svc.sel .st{color:#1a3a2a}
        .ob-svc .sd{font-size:11px;color:#6b7280;line-height:1.4}
        .ob-pledge{background:#f0faf4;border:1.5px solid #b8e0c4;border-radius:10px;padding:16px 18px;cursor:pointer;transition:all 0.15s;display:flex;align-items:flex-start;gap:14px}
        .ob-pledge:hover{border-color:#2d6a4f}
        .ob-pledge.chk{border-color:#1a3a2a;background:#e6f4ea}
        .ob-box{width:22px;height:22px;border-radius:5px;flex-shrink:0;border:2px solid #c8d4c0;background:#fff;display:flex;align-items:center;justify-content:center;transition:all 0.15s;margin-top:2px}
        .ob-pledge.chk .ob-box{background:#1a3a2a;border-color:#1a3a2a}
        .ob-ck{color:#fff;font-size:13px;font-weight:800;line-height:1}
        .ob-hr-row{display:grid;grid-template-columns:110px 1fr 1fr 90px;gap:8px;align-items:center;padding:10px 0;border-bottom:1px solid #f0ebe0}
        .ob-hr-row:last-child{border-bottom:none}
        .ob-ti{padding:8px 10px;border:1.5px solid #d4cfc7;border-radius:6px;font-size:13px;color:#1c1c1c;background:#fff;outline:none;width:100%}
        .ob-ti:disabled{background:#f5f0e8;color:#b0a898;cursor:not-allowed}
        .ob-hbtn{padding:8px 6px;border:1.5px solid #d4cfc7;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;text-align:center;transition:all 0.15s;background:#fff;color:#6b7280;white-space:nowrap}
        .ob-hbtn.closed{background:#fdecea;border-color:#f5c6c6;color:#c62828}
        .ob-hbtn.open{background:#e8f5e9;border-color:#b8ddc0;color:#2e7d32}
        .ob-rrow{display:flex;justify-content:space-between;align-items:flex-start;padding:12px 0;border-bottom:1px solid #f0ebe0;gap:16px}
        .ob-rrow:last-child{border-bottom:none}
        .ob-rk{font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.06em;flex-shrink:0;width:130px;margin-top:2px}
        .ob-rv{font-size:14px;color:#1c1c1c;text-align:right;max-width:60%}
        .pac-container{z-index:9999!important;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,0.12);border:1px solid #e5e0d5;font-family:'DM Sans',sans-serif}
        .pac-item{padding:8px 14px;font-size:13px;cursor:pointer}
        .pac-item:hover,.pac-item-selected{background:#f0faf4}
      `}</style>

      <div className="ob">
        {/* Header */}
        <div style={{ position:"sticky", top:0, zIndex:10, background:"var(--forest-mid)", borderBottom:"1px solid var(--rule-mid)" }}>
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <span style={{ display:'flex', alignItems:'baseline', gap:0 }}>
              <span style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, color:'#fff', letterSpacing:'-0.015em' }}>District</span>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--gold)', letterSpacing:'0.08em', marginLeft:6, position:'relative', top:-1 }}>1921</span>
            </span>
            <span className="text-sm text-white/60">Set up your business</span>
          </div>
        </div>

        {/* Progress */}
        <div style={{ background:"var(--surface-card)", borderBottom:"1px solid var(--rule)" }}>
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step > s.id ? 'bg-[#2d6a4f] text-white' : step === s.id ? 'bg-[#1a3a2a] text-white' : 'bg-[#f0ebe0] text-[#b0a898]'}`}>
                      {step > s.id ? '✓' : s.id}
                    </div>
                    <span className={`text-xs mt-1 font-medium hidden sm:block ${step >= s.id ? 'text-[#1a3a2a]' : 'text-[#b0a898]'}`}>{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 mx-1 ${step > s.id ? 'bg-[#2d6a4f]' : 'bg-[#e5e0d5]'}`} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8">
          {isAdmin && (
            <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'#c9a84c',color:'#1a3a2a',padding:'4px 12px',borderRadius:4,fontSize:11,fontWeight:700,letterSpacing:'0.05em',marginBottom:16}}>
              ⭐ Admin — listing goes live immediately
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <h1 style={{...S, fontSize:'26px', fontWeight:700, color:'#1a3a2a', marginBottom:6}}>Tell us about your business</h1>
              <p style={{fontSize:14, color:'#6b7280', marginBottom:32}}>This is how your business will appear in the directory.</p>

              <div className="ob-field">
                <label className="ob-label">Business Name</label>
                <input className="ob-input" type="text" placeholder="e.g. Mama's Southern Kitchen"
                  value={form.name} onChange={e => setField('name', e.target.value)} maxLength={100} autoFocus />
                {form.name && (
                  <p style={{fontSize:12,color:'#8a7a5a',marginTop:6}}>
                    Your listing URL: <span style={{fontFamily:'monospace',color:'#2d6a4f'}}>district1921.com/business/{slugify(form.name)||'...'}</span>
                  </p>
                )}
              </div>

              <div className="ob-field">
                <label className="ob-label">Category</label>
                <span className="ob-sublabel">Choose the one that best describes your business.</span>
                <div className="ob-cat-grid">
                  {(Object.entries(CATEGORY_LABELS) as [BusinessCategory, string][]).map(([val, label]) => (
                    <button key={val} type="button" className={`ob-cat-btn ${form.category === val ? 'selected' : ''}`} onClick={() => setField('category', val)}>{label}</button>
                  ))}
                </div>
              </div>

              <div className="ob-field">
                <div className={`ob-pledge ${form.honor_pledge ? 'chk' : ''}`} onClick={() => setField('honor_pledge', !form.honor_pledge)}>
                  <div className="ob-box">{form.honor_pledge && <span className="ob-ck">✓</span>}</div>
                  <div>
                    <div style={{fontSize:14,fontWeight:700,color:'#1a3a2a',marginBottom:5}}>Honor Pledge</div>
                    <div style={{fontSize:13,color:'#2d6a4f',lineHeight:1.6}}>I affirm that this business is community-owned and operated. I understand that District 1921 is built on trust, and I will represent my business honestly.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <h1 style={{...S, fontSize:'26px', fontWeight:700, color:'#1a3a2a', marginBottom:6}}>Where are you located?</h1>
              <p style={{fontSize:14, color:'#6b7280', marginBottom:28}}>Mobile-only businesses just need city and state.</p>

              <div className="ob-field">
                <label className="ob-label">Service Type</label>
                <div className="ob-svc-grid">
                  {([
                    {type:'storefront',icon:'🏪',title:'Storefront',desc:'Customers come to a fixed location'},
                    {type:'mobile_only',icon:'📱',title:'Mobile Only',desc:'I travel to my customers'},
                    {type:'both',icon:'🏪📱',title:'Both',desc:'Fixed location + mobile service'},
                  ] as {type:ServiceType;icon:string;title:string;desc:string}[]).map(o => (
                    <div key={o.type} className={`ob-svc ${form.service_type===o.type?'sel':''}`} onClick={() => setField('service_type', o.type)}>
                      <div className="si">{o.icon}</div>
                      <div className="st">{o.title}</div>
                      <div className="sd">{o.desc}</div>
                    </div>
                  ))}
                </div>
              </div>


              {/* Service Area */}
              <div className="ob-field">
                <label className="ob-label">Service Area</label>
                <span className="ob-sublabel">Where do you serve customers? This determines where you appear in search results.</span>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  {([
                    {val:'local',icon:'📍',title:'Local',desc:'My city & surrounding area'},
                    {val:'statewide',icon:'🗺',title:'Statewide',desc:'Anywhere in my state'},
                    {val:'nationwide',icon:'🇺🇸',title:'Nationwide',desc:'Serving customers across the US'},
                    {val:'online',icon:'💻',title:'Online / Virtual',desc:'No physical location — fully online'},
                  ] as {val:'local'|'statewide'|'nationwide'|'online';icon:string;title:string;desc:string}[]).map(o => (
                    <div key={o.val}
                      style={{border:`1.5px solid ${form.service_area===o.val?'#1a3a2a':'#d4cfc7'}`,borderRadius:8,padding:'12px 14px',cursor:'pointer',background:form.service_area===o.val?'#f0faf4':'#fff',transition:'all 0.15s'}}
                      onClick={() => setField('service_area', o.val)}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                        <span style={{fontSize:18}}>{o.icon}</span>
                        <span style={{fontSize:13,fontWeight:700,color:form.service_area===o.val?'#1a3a2a':'#1c1c1c'}}>{o.title}</span>
                      </div>
                      <div style={{fontSize:11,color:'#6b7280',lineHeight:1.4}}>{o.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {needsAddress && (
                <>
                  <div className="ob-field">
                    <label className="ob-label">Street Address</label>
                    <span className="ob-sublabel">Start typing — we'll auto-fill city, state, and ZIP.</span>
                    {mapsLoaded
                      ? <AddressAutocomplete value={form.address} onChange={handleAddressChange} onPlaceSelect={handlePlaceSelect} />
                      : <input className="ob-input" type="text" placeholder="1842 Broad St" value={form.address} onChange={e => setField('address', e.target.value)} />
                    }
                  </div>
                  <div className="ob-field">
                    <label className="ob-label">Suite / Unit / Floor <span style={{color:'#b0a898',fontWeight:400}}>(optional)</span></label>
                    <input className="ob-input" type="text" placeholder="Suite 200, Unit 4B, Floor 3..." value={form.suite} onChange={e => setField('suite', e.target.value)} />
                  </div>
                </>
              )}

              <div style={{display:'grid', gridTemplateColumns:'1fr 100px', gap:12}}>
                <div className="ob-field">
                  <label className="ob-label">City <span style={{color:'#c62828'}}>*</span></label>
                  <input className="ob-input" type="text" placeholder="Augusta" value={form.city} onChange={e => setField('city', e.target.value)} />
                </div>
                <div className="ob-field">
                  <label className="ob-label">State <span style={{color:'#c62828'}}>*</span></label>
                  <select className="ob-select" value={form.state} onChange={e => setField('state', e.target.value)}>
                    <option value="">—</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {needsAddress && (
                <div className="ob-field" style={{maxWidth:180}}>
                  <label className="ob-label">ZIP Code</label>
                  <input className="ob-input" type="text" placeholder="30901" value={form.zip} onChange={e => setField('zip', e.target.value)} maxLength={10} />
                </div>
              )}
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <h1 style={{...S, fontSize:'26px', fontWeight:700, color:'#1a3a2a', marginBottom:6}}>How can customers reach you?</h1>
              <p style={{fontSize:14, color:'#6b7280', marginBottom:12}}>All optional — add or update anytime from your dashboard.</p>
              <div style={{background:'#fef9ee',border:'1px solid #e8d090',borderLeft:'3px solid #c9a84c',borderRadius:8,padding:'14px 18px',marginBottom:24,fontSize:13,color:'#5a4a20',lineHeight:1.6}}>
                📋 Contact info is <strong>only visible on Professional Pages</strong> ($15/mo). Free listings show name, category, and city only.
              </div>
              <div className="ob-field"><label className="ob-label">Phone Number</label><input className="ob-input" type="tel" placeholder="(706) 555-0182" value={form.phone} onChange={e => setField('phone', e.target.value)} /></div>
              <div className="ob-field"><label className="ob-label">Website</label><input className="ob-input" type="url" placeholder="https://yourwebsite.com" value={form.website} onChange={e => setField('website', e.target.value)} /></div>
              <div className="ob-field">
                <label className="ob-label">Business Email</label>
                <span className="ob-sublabel">For customer contact — can differ from your login email.</span>
                <input className="ob-input" type="email" placeholder="hello@yourbusiness.com" value={form.email} onChange={e => setField('email', e.target.value)} />
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div>
              <h1 style={{...S, fontSize:'26px', fontWeight:700, color:'#1a3a2a', marginBottom:6}}>Tell your story</h1>
              <p style={{fontSize:14, color:'#6b7280', marginBottom:28}}>Write naturally — who you are, what you offer, what makes you different. Our AI will polish it up.</p>
              <div className="ob-field">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                  <label className="ob-label" style={{margin:0}}>Business Description</label>
                  <button type="button" onClick={cleanWithAI}
                    disabled={cleaning || form.description.trim().length < 20}
                    style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:6,border:'1.5px solid #2d6a4f',background:cleaning?'#e8f5ec':'#fff',color:'#2d6a4f',fontSize:12,fontWeight:700,cursor:cleaning||form.description.trim().length<20?'not-allowed':'pointer',opacity:form.description.trim().length<20?0.45:1,transition:'all 0.15s'}}>
                    {cleaning ? '✨ Polishing...' : '✨ Polish with AI'}
                  </button>
                </div>
                <span className="ob-sublabel">Minimum 20 characters. Be specific — what do you offer and what's your story?</span>
                <textarea className="ob-input" rows={7}
                  placeholder="e.g. We've been serving Augusta since 1987, specializing in authentic Southern cuisine made from scratch daily..."
                  value={form.description} onChange={e => setField('description', e.target.value)}
                  style={{resize:'vertical',lineHeight:'1.65'}} />
                <div style={{display:'flex',justifyContent:'space-between',marginTop:6}}>
                  <span style={{fontSize:12,color:form.description.length<20?'#c62828':'#2d6a4f'}}>
                    {form.description.length<20 ? `${20-form.description.length} more characters needed` : '✓ Good to go'}
                  </span>
                  <span style={{fontSize:12,color:'#6b7280'}}>{form.description.length} / 2000</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div>
              <h1 style={{...S, fontSize:'26px', fontWeight:700, color:'#1a3a2a', marginBottom:6}}>What are your hours?</h1>
              <p style={{fontSize:14, color:'#6b7280', marginBottom:28}}>Update anytime from your dashboard.</p>
              <div style={{background:'#fff',border:'1px solid #e5e0d5',borderRadius:12,overflow:'hidden'}}>
                <div style={{padding:'4px 24px 16px'}}>
                  {DAYS.map(day => {
                    const h = form.hours[day] ?? {open:'09:00',close:'17:00',closed:false}
                    return (
                      <div key={day} className="ob-hr-row">
                        <span style={{fontSize:13,fontWeight:600,color:'#1c1c1c'}}>{DAY_LABELS[day]}</span>
                        <input type="time" className="ob-ti" value={h.open} disabled={h.closed} onChange={e => setHours(day,'open',e.target.value)} />
                        <input type="time" className="ob-ti" value={h.close} disabled={h.closed} onChange={e => setHours(day,'close',e.target.value)} />
                        <button type="button" className={`ob-hbtn ${h.closed?'closed':'open'}`} onClick={() => setHours(day,'closed',!h.closed)}>
                          {h.closed?'Closed':'Open'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6 */}
          {step === 6 && (
            <div>
              <h1 style={{...S, fontSize:'26px', fontWeight:700, color:'#1a3a2a', marginBottom:6}}>Review & submit</h1>
              <p style={{fontSize:14, color:'#6b7280', marginBottom:28}}>
                {isAdmin ? 'As admin, your listing goes live immediately.' : "Once submitted, we'll review it within 24–48 hours."}
              </p>
              <div style={{background:'#fff',border:'1px solid #e5e0d5',borderRadius:12,overflow:'hidden',marginBottom:20}}>
                <div style={{padding:'14px 24px',borderBottom:'1px solid #e5e0d5',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontWeight:700,fontSize:16,color:'#1a3a2a'}}>{form.name}</span>
                  <button onClick={() => setStep(1)} style={{fontSize:12,color:'#2d6a4f',textDecoration:'underline',background:'none',border:'none',cursor:'pointer'}}>Edit</button>
                </div>
                <div style={{padding:'4px 24px 8px'}}>
                  <div className="ob-rrow"><span className="ob-rk">Category</span><span className="ob-rv">{form.category ? CATEGORY_LABELS[form.category as BusinessCategory] : '—'}</span></div>
                  <div className="ob-rrow"><span className="ob-rk">Service Type</span><span className="ob-rv">{form.service_type==='storefront'?'🏪 Storefront':form.service_type==='mobile_only'?'📱 Mobile Only':'🏪📱 Both'}</span></div>
                  <div className="ob-rrow"><span className="ob-rk">Location</span><span className="ob-rv">{[form.address,form.suite,form.city,form.state,form.zip].filter(Boolean).join(', ')||`${form.city}, ${form.state}`}</span></div>
                  <div className="ob-rrow"><span className="ob-rk">Phone</span><span className="ob-rv">{form.phone||<span style={{color:'#b0a898'}}>—</span>}</span></div>
                  <div className="ob-rrow"><span className="ob-rk">Website</span><span className="ob-rv">{form.website||<span style={{color:'#b0a898'}}>—</span>}</span></div>
                  <div className="ob-rrow"><span className="ob-rk">Honor Pledge</span><span className="ob-rv" style={{color:'#2d6a4f',fontWeight:700}}>✓ Signed</span></div>
                </div>
              </div>
              {!isAdmin && (
                <div style={{background:'#d8f3dc',border:'1px solid #b8e0c4',borderRadius:10,padding:'16px 20px',marginBottom:20,fontSize:13,color:'#1a3a2a'}}>
                  <p style={{fontWeight:700,marginBottom:8}}>What happens next:</p>
                  <ul style={{paddingLeft:16,color:'#2d6a4f',lineHeight:1.8}}>
                    <li>Your listing enters our review queue (24–48 hrs)</li>
                    <li>Once approved, it appears in search results immediately</li>
                    <li>Upgrade to a Professional Page anytime from your dashboard</li>
                    <li>Apply for Gold Shield verification when you're ready</li>
                  </ul>
                </div>
              )}
              {error && <div style={{background:'#fdecea',border:'1px solid #f5c6c6',borderRadius:8,padding:'12px 16px',marginBottom:16,fontSize:13,color:'#c62828'}}>{error}</div>}
            </div>
          )}

          {/* Nav */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:32,paddingTop:24,borderTop:'1px solid #e5e0d5'}}>
            <button type="button" onClick={() => setStep(s => Math.max(1,s-1))}
              style={{padding:'12px 24px',borderRadius:8,fontSize:14,fontWeight:600,border:'1px solid #d4cfc7',color:'#6b7280',background:'#fff',cursor:'pointer',visibility:step===1?'hidden':'visible'}}>
              ← Back
            </button>
            {step < STEPS.length ? (
              <button type="button" onClick={() => { if (canAdvance()) setStep(s => s+1) }} disabled={!canAdvance()}
                style={{padding:'12px 32px',borderRadius:8,fontSize:14,fontWeight:600,background:canAdvance()?'#1a3a2a':'#d4cfc7',color:'#fff',border:'none',cursor:canAdvance()?'pointer':'not-allowed'}}>
                Continue →
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={loading}
                style={{padding:'12px 32px',borderRadius:8,fontSize:14,fontWeight:700,background:'#c9a84c',color:'#1a3a2a',border:'none',cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1}}>
                {loading ? 'Submitting…' : isAdmin ? 'Publish Listing →' : 'Submit for Review →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
