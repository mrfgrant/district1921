'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { CATEGORY_LABELS, BusinessCategory } from '@/types'

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as const
const DAY_LABELS: Record<string,string> = { monday:'Mon',tuesday:'Tue',wednesday:'Wed',thursday:'Thu',friday:'Fri',saturday:'Sat',sunday:'Sun' }
const EMPTY_HOURS: any = {
  monday:{open:'09:00',close:'17:00',closed:false},tuesday:{open:'09:00',close:'17:00',closed:false},
  wednesday:{open:'09:00',close:'17:00',closed:false},thursday:{open:'09:00',close:'17:00',closed:false},
  friday:{open:'09:00',close:'17:00',closed:false},saturday:{open:'10:00',close:'15:00',closed:false},
  sunday:{open:'10:00',close:'15:00',closed:true},
}
const CATS = Object.entries(CATEGORY_LABELS) as [BusinessCategory, string][]
const IS: React.CSSProperties = { width:'100%',padding:'10px 12px',background:'#141418',border:'1.5px solid #2A2A35',borderRadius:6,fontSize:13,color:'#F0EDE8',outline:'none',fontFamily:"'DM Sans',sans-serif" }
const LB: React.CSSProperties = { display:'block',fontSize:11,fontWeight:700,color:'#A09D98',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:6 }

const DEFAULT_FORM = {
  name:'', category:'food-dining' as BusinessCategory,
  description:'', phone:'', website:'', email:'',
  address:'', suite:'', city:'', state:'', zip:'',
  service_area:'local', is_mobile_service:false,
  subscription_status:'active', gold_shield:false, honor_pledge:true,
  logo_url:'', cover_photo_url:'', photos:[] as string[],
  social_facebook:'', social_instagram:'', social_twitter:'', social_linkedin:'', social_youtube:'', social_tiktok:'',
  hours:{...EMPTY_HOURS}, includeHours:false,
}

export function AdminBusinessManager({ businesses: init }: { businesses: any[] }) {
  const [businesses, setBusinesses] = useState(init)
  const [showForm, setShowForm] = useState(false)
  const [editingBiz, setEditingBiz] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [cleaning, setCleaning] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [toggling, setToggling] = useState<string|null>(null)
  const [toast, setToast] = useState<{msg:string;ok:boolean}|null>(null)
  const [search, setSearch] = useState('')
  const logoRef = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLInputElement>(null)
  const photosRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({...DEFAULT_FORM})

  function sf(k: string, v: any) { setForm(f => ({...f, [k]:v})) }
  function sh(day: string, field: string, v: any) { setForm(f => ({...f, hours:{...f.hours, [day]:{...f.hours[day],[field]:v}}})) }
  function showT(msg:string, ok:boolean) { setToast({msg,ok}); setTimeout(()=>setToast(null),3500) }

  function openCreate() {
    setEditingBiz(null)
    setForm({...DEFAULT_FORM})
    setShowForm(true)
  }

  function openEdit(biz: any) {
    setEditingBiz(biz)
    setForm({
      name: biz.name||'', category: biz.category||'food-dining',
      description: biz.description||'', phone: biz.phone||'',
      website: biz.website||'', email: biz.email||'',
      address: biz.address||'', suite: biz.suite||'',
      city: biz.city||'', state: biz.state||'', zip: biz.zip||'',
      service_area: biz.service_area||'local',
      is_mobile_service: biz.is_mobile_service||false,
      subscription_status: biz.subscription_status||'active',
      gold_shield: biz.gold_shield||false,
      honor_pledge: biz.honor_pledge||true,
      logo_url: biz.logo_url||'',
      cover_photo_url: biz.cover_photo_url||'',
      photos: biz.photos||[],
      social_facebook: biz.social_facebook||'',
      social_instagram: biz.social_instagram||'',
      social_twitter: biz.social_twitter||'',
      social_linkedin: biz.social_linkedin||'',
      social_youtube: biz.social_youtube||'',
      social_tiktok: biz.social_tiktok||'',
      hours: biz.hours||{...EMPTY_HOURS},
      includeHours: !!biz.hours,
    })
    setShowForm(true)
  }

  async function uploadImage(file: File, bucket: string, bizId: string): Promise<string|null> {
    const supabase = createClient()
    const path = `${bizId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${file.name.split('.').pop()}`
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true, contentType: file.type })
    if (error) { console.error(error); return null }
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path)
    return publicUrl
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setUploadingLogo(true)
    const bizId = editingBiz?.id || 'admin-upload'
    const url = await uploadImage(file, 'business-logos', bizId)
    if (url) sf('logo_url', url)
    setUploadingLogo(false)
  }


  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setUploadingCover(true)
    const bizId = editingBiz?.id || 'admin-upload'
    const url = await uploadImage(file, 'business-photos', bizId)
    if (url) sf('cover_photo_url', url)
    setUploadingCover(false)
  }

  async function handlePhotosUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files||[]); if (!files.length) return
    setUploadingPhotos(true)
    const bizId = editingBiz?.id || 'admin-upload'
    const urls: string[] = []
    for (const file of files.slice(0, 8 - form.photos.length)) {
      const url = await uploadImage(file, 'business-photos', bizId)
      if (url) urls.push(url)
    }
    if (urls.length) sf('photos', [...form.photos, ...urls])
    setUploadingPhotos(false)
  }

  async function cleanWithAI() {
    if (!form.description.trim() || form.description.length < 20) return
    setCleaning(true)
    try {
      const res = await fetch('/api/ai/clean-description', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ description: form.description, businessName: form.name }),
      })
      if (res.ok) { const { cleaned } = await res.json(); sf('description', cleaned) }
    } finally { setCleaning(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true)
    const payload = {
      ...form,
      hours: form.includeHours ? form.hours : null,
      logo_url: form.logo_url || null,
      cover_photo_url: form.cover_photo_url || null,
      photos: form.photos,
    }

    if (editingBiz) {
      // Edit existing
      const res = await fetch('/api/admin/businesses', {
        method:'PATCH', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ businessId: editingBiz.id, updates: payload }),
      })
      if (res.ok) {
        setBusinesses(p => p.map(b => b.id===editingBiz.id ? {...b,...payload} : b))
        setShowForm(false)
        showT(`"${form.name}" updated.`, true)
      } else {
        const d = await res.json().catch(()=>({}))
        showT(d.error||'Update failed', false)
      }
    } else {
      // Create new
      const res = await fetch('/api/admin/businesses', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const {business} = await res.json()
        setBusinesses(p => [{...business,status:'active',subscription_status:form.subscription_status,gold_shield:form.gold_shield,created_at:new Date().toISOString(),category:form.category,city:form.city,state:form.state,logo_url:form.logo_url},...p])
        setShowForm(false)
        showT(`"${business.name}" created and live.`, true)
      } else {
        const d = await res.json().catch(()=>({}))
        showT(d.error||'Failed to create', false)
      }
    }
    setSubmitting(false)
  }

  async function toggleShield(biz: any) {
    setToggling(biz.id+'-shield')
    const val = !biz.gold_shield
    const res = await fetch('/api/admin/businesses', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({businessId:biz.id, updates:{gold_shield:val}}) })
    if (res.ok) { setBusinesses(p=>p.map(b=>b.id===biz.id?{...b,gold_shield:val}:b)); showT(`Gold Shield ${val?'granted':'revoked'}.`, true) }
    setToggling(null)
  }

  async function togglePro(biz: any) {
    const val = biz.subscription_status==='active' ? 'none' : 'active'
    const res = await fetch('/api/admin/businesses', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({businessId:biz.id, updates:{subscription_status:val}}) })
    if (res.ok) { setBusinesses(p=>p.map(b=>b.id===biz.id?{...b,subscription_status:val}:b)); showT(`${val==='active'?'Upgraded to Pro':'Downgraded to Free'}.`, true) }
  }

  const filtered = businesses.filter(b => !search || b.name?.toLowerCase().includes(search.toLowerCase()) || b.city?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="max-w-5xl">
      {toast && <div style={{position:'fixed',top:24,right:24,zIndex:1000,background:toast.ok?'#1a3a2a':'#8B2020',color:'#fff',padding:'12px 20px',borderRadius:8,fontSize:13,fontWeight:600,boxShadow:'0 4px 16px rgba(0,0,0,0.3)'}}>{toast.msg}</div>}

      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl text-[var(--color-gold)]">Businesses</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{businesses.length} total</p>
        </div>
        <button onClick={openCreate} className="px-5 py-2.5 bg-[var(--color-gold)] text-[var(--color-midnight)] text-sm font-bold rounded-lg hover:bg-[#dbb95a] transition-colors">+ Add Business</button>
      </div>

      <input type="text" placeholder="Search by name or city..." value={search} onChange={e=>setSearch(e.target.value)}
        className="w-full px-4 py-2.5 mb-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-colors" />

      <div className="flex flex-col gap-2">
        {filtered.map(biz => (
          <div key={biz.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex items-center gap-4 flex-wrap">
            {/* Logo thumbnail */}
            <div style={{width:40,height:40,borderRadius:8,flexShrink:0,background:biz.logo_url?`url(${biz.logo_url}) center/cover`:'#2A2A35',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:700,color:'#c9a84c',fontFamily:"'Playfair Display',serif"}}>
              {!biz.logo_url && (biz.name?.[0]??'?')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-semibold text-[var(--color-text)]">{biz.name}</span>
                {biz.gold_shield && <span style={{fontSize:10,background:'rgba(201,168,76,0.2)',color:'#c9a84c',padding:'1px 7px',borderRadius:4,fontWeight:800}}>🛡 GOLD</span>}
                {biz.subscription_status==='active' && <span style={{fontSize:10,background:'rgba(45,106,79,0.2)',color:'#4CAF74',padding:'1px 7px',borderRadius:4,fontWeight:700}}>PRO</span>}
              </div>
              <div className="text-xs text-[var(--color-text-secondary)]">
                {CATEGORY_LABELS[biz.category as BusinessCategory]??biz.category} · {biz.city}, {biz.state} · <span style={{color:biz.status==='active'?'#4CAF74':'#9CA3AF'}}>{biz.status}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
              <button onClick={()=>openEdit(biz)}
                style={{padding:'6px 12px',borderRadius:6,fontSize:11,fontWeight:700,cursor:'pointer',border:'1.5px solid #2A2A35',background:'#141418',color:'#A09D98',transition:'all 0.15s'}}>
                ✏️ Edit
              </button>
              <button onClick={()=>toggleShield(biz)} disabled={toggling===biz.id+'-shield'}
                style={{padding:'6px 12px',borderRadius:6,fontSize:11,fontWeight:700,cursor:'pointer',border:'1.5px solid',borderColor:biz.gold_shield?'#c9a84c':'#2A2A35',background:biz.gold_shield?'rgba(201,168,76,0.1)':'#141418',color:biz.gold_shield?'#c9a84c':'#6B6B80',opacity:toggling===biz.id+'-shield'?0.5:1}}>
                🛡 {biz.gold_shield?'Revoke':'Grant'}
              </button>
              <button onClick={()=>togglePro(biz)}
                style={{padding:'6px 12px',borderRadius:6,fontSize:11,fontWeight:700,cursor:'pointer',border:'1.5px solid',borderColor:biz.subscription_status==='active'?'#2d6a4f':'#2A2A35',background:biz.subscription_status==='active'?'rgba(45,106,79,0.1)':'#141418',color:biz.subscription_status==='active'?'#4CAF74':'#6B6B80'}}>
                ★ {biz.subscription_status==='active'?'Revoke Pro':'Grant Pro'}
              </button>
              <Link href={`/business/${biz.slug}`} target="_blank" className="text-xs text-[var(--color-gold)] border border-[rgba(201,168,76,0.3)] px-3 py-1.5 rounded hover:border-[var(--color-gold)] transition-colors">View ↗</Link>
            </div>
          </div>
        ))}
        {filtered.length===0 && <div className="text-center py-12 text-[var(--color-text-secondary)]">{search?'No matches.':'No businesses yet.'}</div>}
      </div>

      {/* Create / Edit Modal */}
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:100,overflowY:'auto',padding:'24px 16px'}} onClick={e=>{if(e.target===e.currentTarget)setShowForm(false)}}>
          <div style={{background:'#1C1C23',border:'1px solid #2A2A35',borderRadius:16,padding:32,maxWidth:680,margin:'0 auto',position:'relative'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:'#fff',margin:0}}>
                {editingBiz ? `Edit: ${editingBiz.name}` : 'Add Business'}
              </h2>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#6B6B80',fontSize:20,cursor:'pointer'}}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Admin flags */}
              <div style={{background:'rgba(201,168,76,0.06)',border:'1px solid rgba(201,168,76,0.2)',borderRadius:8,padding:'14px 16px',marginBottom:20}}>
                <p style={{fontSize:11,fontWeight:700,color:'#c9a84c',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:12}}>Admin Options</p>
                <div style={{display:'flex',gap:20,flexWrap:'wrap'}}>
                  <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
                    <input type="checkbox" checked={form.subscription_status==='active'} onChange={e=>sf('subscription_status',e.target.checked?'active':'none')} style={{width:16,height:16,accentColor:'#c9a84c'}} />
                    <span style={{fontSize:13,color:'#F0EDE8',fontWeight:600}}>★ Pro Page</span>
                  </label>
                  <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
                    <input type="checkbox" checked={form.gold_shield} onChange={e=>sf('gold_shield',e.target.checked)} style={{width:16,height:16,accentColor:'#c9a84c'}} />
                    <span style={{fontSize:13,color:'#F0EDE8',fontWeight:600}}>🛡 Gold Shield</span>
                  </label>
                  <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
                    <input type="checkbox" checked={form.honor_pledge} onChange={e=>sf('honor_pledge',e.target.checked)} style={{width:16,height:16,accentColor:'#c9a84c'}} />
                    <span style={{fontSize:13,color:'#F0EDE8',fontWeight:600}}>✓ Honor Pledge</span>
                  </label>
                </div>
              </div>

              {/* Name + Category */}
              <div style={{marginBottom:14}}>
                <label style={LB}>Business Name *</label>
                <input required style={IS} placeholder="e.g. Mama's Southern Kitchen" value={form.name} onChange={e=>sf('name',e.target.value)} />
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
                <div><label style={LB}>Category *</label>
                  <select required style={IS} value={form.category} onChange={e=>sf('category',e.target.value as BusinessCategory)}>
                    {CATS.map(([k,l])=><option key={k} value={k}>{l}</option>)}
                  </select>
                </div>
                <div><label style={LB}>Service Area</label>
                  <select style={IS} value={form.service_area} onChange={e=>sf('service_area',e.target.value)}>
                    <option value="local">Local</option>
                    <option value="statewide">Statewide</option>
                    <option value="nationwide">Nationwide</option>
                    <option value="online">Online</option>
                  </select>
                </div>
              </div>

              {/* Description + AI cleaner */}
              <div style={{marginBottom:14}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                  <label style={LB}>Description</label>
                  <button type="button" onClick={cleanWithAI} disabled={cleaning||form.description.length<20}
                    style={{display:'flex',alignItems:'center',gap:5,padding:'5px 10px',borderRadius:5,border:'1.5px solid #2d6a4f',background:cleaning?'rgba(45,106,79,0.15)':'transparent',color:'#4CAF74',fontSize:11,fontWeight:700,cursor:form.description.length<20||cleaning?'not-allowed':'pointer',opacity:form.description.length<20?0.4:1,fontFamily:"'DM Sans',sans-serif"}}>
                    {cleaning ? '✨ Polishing...' : '✨ Polish with AI'}
                  </button>
                </div>
                <textarea rows={4} style={{...IS,resize:'vertical',lineHeight:1.65}} placeholder="Tell the story of this business..." value={form.description} onChange={e=>sf('description',e.target.value)} />
              </div>

              {/* Contact */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
                <div><label style={LB}>Phone</label><input style={IS} type="tel" placeholder="(706) 555-0182" value={form.phone} onChange={e=>sf('phone',e.target.value)} /></div>
                <div><label style={LB}>Website</label><input style={IS} type="url" placeholder="https://" value={form.website} onChange={e=>sf('website',e.target.value)} /></div>
                <div><label style={LB}>Business Email</label><input style={IS} type="email" placeholder="hello@biz.com" value={form.email} onChange={e=>sf('email',e.target.value)} /></div>
                <div><label style={LB}>Mobile Service</label>
                  <select style={IS} value={form.is_mobile_service?'1':'0'} onChange={e=>sf('is_mobile_service',e.target.value==='1')}>
                    <option value="0">No — fixed location</option>
                    <option value="1">Yes — travels to customers</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div style={{marginBottom:14}}><label style={LB}>Street Address</label><input style={IS} placeholder="246 Robert C Daniel Jr Pkwy" value={form.address} onChange={e=>sf('address',e.target.value)} /></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 80px 80px',gap:10,marginBottom:20}}>
                <div><label style={LB}>City *</label><input required style={IS} placeholder="Augusta" value={form.city} onChange={e=>sf('city',e.target.value)} /></div>
                <div><label style={LB}>Suite</label><input style={IS} placeholder="Ste 200" value={form.suite} onChange={e=>sf('suite',e.target.value)} /></div>
                <div><label style={LB}>State *</label><input required style={IS} maxLength={2} placeholder="GA" value={form.state} onChange={e=>sf('state',e.target.value.toUpperCase())} /></div>
                <div><label style={LB}>ZIP</label><input style={IS} maxLength={10} placeholder="30909" value={form.zip} onChange={e=>sf('zip',e.target.value)} /></div>
              </div>

              {/* Logo Upload */}
              <div style={{marginBottom:20}}>
                <label style={LB}>Logo</label>
                <div style={{display:'flex',alignItems:'center',gap:16}}>
                  <div style={{width:64,height:64,borderRadius:10,background:form.logo_url?`url(${form.logo_url}) center/cover`:'#2A2A35',border:'2px solid #3A3A45',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,color:'#6B6B80',flexShrink:0}}>
                    {!form.logo_url && '🏪'}
                  </div>
                  <div>
                    <button type="button" onClick={()=>logoRef.current?.click()} disabled={uploadingLogo}
                      style={{padding:'8px 16px',background:'#c9a84c',color:'#1a3a2a',border:'none',borderRadius:6,fontSize:12,fontWeight:700,cursor:'pointer',marginBottom:4,display:'block',fontFamily:"'DM Sans',sans-serif"}}>
                      {uploadingLogo ? 'Uploading...' : form.logo_url ? 'Change Logo' : 'Upload Logo'}
                    </button>
                    <span style={{fontSize:11,color:'#6B6B80'}}>JPG, PNG, WebP · Max 5MB</span>
                    <input ref={logoRef} type="file" accept="image/jpeg,image/png,image/webp" style={{display:'none'}} onChange={handleLogoUpload} />
                    {form.logo_url && (
                      <button type="button" onClick={()=>sf('logo_url','')} style={{display:'block',marginTop:4,fontSize:11,color:'#ef9a9a',background:'none',border:'none',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>Remove logo</button>
                    )}
                  </div>
                </div>
              </div>

              {/* Cover Photo Upload */}
              <div style={{marginBottom:20}}>
                <label style={LB}>Cover Photo <span style={{color:'#6B6B80',textTransform:'none',letterSpacing:0,fontWeight:400}}>(banner behind logo)</span></label>
                <div style={{position:'relative',width:'100%',height:100,borderRadius:10,overflow:'hidden',background:form.cover_photo_url?`url(${form.cover_photo_url}) center/cover`:'linear-gradient(135deg,#1a3a2a,#2d6a4f)',marginBottom:8,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {!form.cover_photo_url && <span style={{color:'rgba(255,255,255,0.4)',fontSize:12}}>No cover photo</span>}
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button type="button" onClick={()=>coverRef.current?.click()} disabled={uploadingCover}
                    style={{padding:'7px 14px',background:'#2A2A35',border:'1.5px solid #3A3A45',borderRadius:6,fontSize:12,fontWeight:600,color:'#F0EDE8',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
                    {uploadingCover ? 'Uploading...' : form.cover_photo_url ? '🖼 Change Cover' : '🖼 Upload Cover'}
                  </button>
                  {form.cover_photo_url && (
                    <button type="button" onClick={()=>sf('cover_photo_url','')}
                      style={{padding:'7px 14px',background:'transparent',border:'1.5px solid #3A3A45',borderRadius:6,fontSize:12,fontWeight:600,color:'#ef9a9a',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
                      Remove
                    </button>
                  )}
                </div>
                <input ref={coverRef} type="file" accept="image/jpeg,image/png,image/webp" style={{display:'none'}} onChange={handleCoverUpload} />
              </div>

              {/* Photos Upload */}
              <div style={{marginBottom:20}}>
                <label style={LB}>Photos ({form.photos.length}/8)</label>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:8}}>
                  {form.photos.map((url,i) => (
                    <div key={url} style={{position:'relative',aspectRatio:'1',borderRadius:8,overflow:'hidden',background:'#2A2A35'}}>
                      <img src={url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                      <button type="button" onClick={()=>sf('photos',form.photos.filter((_,j)=>j!==i))}
                        style={{position:'absolute',top:3,right:3,width:20,height:20,borderRadius:'50%',background:'rgba(0,0,0,0.75)',color:'#fff',border:'none',cursor:'pointer',fontSize:11,display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
                    </div>
                  ))}
                  {form.photos.length < 8 && (
                    <button type="button" onClick={()=>photosRef.current?.click()} disabled={uploadingPhotos}
                      style={{aspectRatio:'1',borderRadius:8,border:'2px dashed #2A2A35',background:'#141418',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'#6B6B80',fontSize:11,gap:4,fontFamily:"'DM Sans',sans-serif"}}>
                      <span style={{fontSize:18}}>{uploadingPhotos ? '⏳' : '+'}</span>
                      {uploadingPhotos ? 'Uploading...' : 'Add Photo'}
                    </button>
                  )}
                </div>
                <input ref={photosRef} type="file" accept="image/jpeg,image/png,image/webp" multiple style={{display:'none'}} onChange={handlePhotosUpload} />
                <span style={{fontSize:11,color:'#6B6B80'}}>JPG, PNG, WebP · Max 10MB each · Up to 8 photos</span>
              </div>

              {/* Hours */}
              <div style={{marginBottom:20}}>
                <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',marginBottom:form.includeHours?12:0}}>
                  <input type="checkbox" checked={form.includeHours} onChange={e=>sf('includeHours',e.target.checked)} style={{width:16,height:16,accentColor:'#c9a84c'}} />
                  <span style={{fontSize:13,fontWeight:600,color:'#F0EDE8'}}>Include business hours</span>
                </label>
                {form.includeHours && (
                  <div style={{background:'#141418',border:'1px solid #2A2A35',borderRadius:8,padding:'10px 14px'}}>
                    {DAYS.map(day=>{
                      const h=form.hours[day]??{open:'09:00',close:'17:00',closed:false}
                      return (
                        <div key={day} style={{display:'grid',gridTemplateColumns:'56px 1fr 1fr 72px',gap:8,alignItems:'center',padding:'6px 0',borderBottom:'1px solid #2A2A35'}}>
                          <span style={{fontSize:12,fontWeight:600,color:h.closed?'#6B6B80':'#F0EDE8'}}>{DAY_LABELS[day]}</span>
                          <input type="time" disabled={h.closed} value={h.open} onChange={e=>sh(day,'open',e.target.value)} style={{...IS,padding:'6px 8px',fontSize:12,opacity:h.closed?0.4:1}} />
                          <input type="time" disabled={h.closed} value={h.close} onChange={e=>sh(day,'close',e.target.value)} style={{...IS,padding:'6px 8px',fontSize:12,opacity:h.closed?0.4:1}} />
                          <button type="button" onClick={()=>sh(day,'closed',!h.closed)} style={{padding:'6px',borderRadius:5,fontSize:11,fontWeight:600,cursor:'pointer',border:'1.5px solid',borderColor:h.closed?'#c62828':'#2A2A35',background:h.closed?'rgba(198,40,40,0.15)':'#1C1C23',color:h.closed?'#ef9a9a':'#6B6B80'}}>
                            {h.closed?'Closed':'Open'}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>


              {/* Social Links */}
              <div style={{marginBottom:20}}>
                <label style={LB}>Social Media <span style={{color:'#6B6B80',textTransform:'none',letterSpacing:0,fontWeight:400}}>(optional)</span></label>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                  {[
                    {k:'social_instagram',p:'Instagram (@handle or URL)'},
                    {k:'social_facebook',p:'Facebook (page name or URL)'},
                    {k:'social_twitter',p:'X / Twitter (@handle or URL)'},
                    {k:'social_linkedin',p:'LinkedIn (profile or URL)'},
                    {k:'social_youtube',p:'YouTube (@handle or URL)'},
                    {k:'social_tiktok',p:'TikTok (@handle or URL)'},
                  ].map(f => (
                    <input key={f.k} style={IS} placeholder={f.p} value={(form as any)[f.k]} onChange={e=>sf(f.k,e.target.value)} />
                  ))}
                </div>
              </div>

              <div style={{display:'flex',gap:10}}>
                <button type="button" onClick={()=>setShowForm(false)} style={{flex:1,padding:'12px',background:'#141418',border:'1.5px solid #2A2A35',borderRadius:8,fontSize:13,fontWeight:600,color:'#A09D98',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>Cancel</button>
                <button type="submit" disabled={submitting||!form.name||!form.city||!form.state}
                  style={{flex:2,padding:'12px',background:'#c9a84c',border:'none',borderRadius:8,fontSize:13,fontWeight:700,color:'#1a3a2a',cursor:submitting?'not-allowed':'pointer',opacity:submitting?0.7:1,fontFamily:"'DM Sans',sans-serif"}}>
                  {submitting ? (editingBiz ? 'Saving...' : 'Creating...') : editingBiz ? 'Save Changes' : `Create & Publish${form.gold_shield?' 🛡':''}${form.subscription_status==='active'?' ★':''}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
