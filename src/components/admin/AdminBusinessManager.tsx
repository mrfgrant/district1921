'use client'
import { useState } from 'react'
import Link from 'next/link'
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

export function AdminBusinessManager({ businesses: init }: { businesses: any[] }) {
  const [businesses, setBusinesses] = useState(init)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toggling, setToggling] = useState<string|null>(null)
  const [toast, setToast] = useState<{msg:string;ok:boolean}|null>(null)
  const [search, setSearch] = useState('')

  const [form, setForm] = useState({
    name:'', category:'food-dining' as BusinessCategory,
    description:'', phone:'', website:'', email:'',
    address:'', suite:'', city:'', state:'', zip:'',
    service_area:'local', is_mobile_service:false,
    subscription_status:'active', gold_shield:false, honor_pledge:true,
    hours:{...EMPTY_HOURS}, includeHours:false,
  })

  function sf(k: string, v: any) { setForm(f => ({...f, [k]:v})) }
  function sh(day: string, field: string, v: any) { setForm(f => ({...f, hours:{...f.hours, [day]:{...f.hours[day],[field]:v}}})) }
  function showT(msg:string, ok:boolean) { setToast({msg,ok}); setTimeout(()=>setToast(null),3500) }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true)
    const res = await fetch('/api/admin/businesses', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({...form, hours: form.includeHours ? form.hours : null}),
    })
    if (res.ok) {
      const {business} = await res.json()
      setBusinesses(p => [{...business,status:'active',subscription_status:form.subscription_status,gold_shield:form.gold_shield,created_at:new Date().toISOString(),category:form.category,city:form.city,state:form.state},...p])
      setShowForm(false)
      setForm({name:'',category:'food-dining',description:'',phone:'',website:'',email:'',address:'',suite:'',city:'',state:'',zip:'',service_area:'local',is_mobile_service:false,subscription_status:'active',gold_shield:false,honor_pledge:true,hours:{...EMPTY_HOURS},includeHours:false})
      showT(`Created successfully.`, true)
    } else {
      const d = await res.json().catch(()=>({}))
      showT(d.error||'Failed to create', false)
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
    if (res.ok) { setBusinesses(p=>p.map(b=>b.id===biz.id?{...b,subscription_status:val}:b)); showT(`${biz.name} ${val==='active'?'upgraded to Pro':'downgraded to Free'}.`, true) }
  }

  const filtered = businesses.filter(b => !search || b.name?.toLowerCase().includes(search.toLowerCase()) || b.city?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="max-w-5xl">
      {toast && <div style={{position:'fixed',top:24,right:24,zIndex:1000,background:toast.ok?'#1a3a2a':'#8B2020',color:'#fff',padding:'12px 20px',borderRadius:8,fontSize:13,fontWeight:600,boxShadow:'0 4px 16px rgba(0,0,0,0.3)'}}>{toast.msg}</div>}

      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl text-[var(--color-gold)]">Businesses</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{businesses.length} total · Add listings without owner signup</p>
        </div>
        <button onClick={()=>setShowForm(true)} className="px-5 py-2.5 bg-[var(--color-gold)] text-[var(--color-midnight)] text-sm font-bold rounded-lg hover:bg-[#dbb95a] transition-colors">+ Add Business</button>
      </div>

      <input type="text" placeholder="Search by name or city..." value={search} onChange={e=>setSearch(e.target.value)}
        className="w-full px-4 py-2.5 mb-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-colors" />

      <div className="flex flex-col gap-2">
        {filtered.map(biz => (
          <div key={biz.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-semibold text-[var(--color-text)]">{biz.name}</span>
                {biz.gold_shield && <span style={{fontSize:10,background:'rgba(201,168,76,0.2)',color:'#c9a84c',padding:'1px 7px',borderRadius:4,fontWeight:800}}>🛡 GOLD</span>}
                {biz.subscription_status==='active' && <span style={{fontSize:10,background:'rgba(45,106,79,0.2)',color:'#4CAF74',padding:'1px 7px',borderRadius:4,fontWeight:700}}>PRO</span>}
              </div>
              <div className="text-xs text-[var(--color-text-secondary)]">
                {CATEGORY_LABELS[biz.category as BusinessCategory]??biz.category} · {biz.city}, {biz.state} · <span style={{color:biz.status==='active'?'#4CAF74':'#9CA3AF'}}>{biz.status}</span> · {new Date(biz.created_at).toLocaleDateString()}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={()=>toggleShield(biz)} disabled={toggling===biz.id+'-shield'}
                style={{padding:'6px 12px',borderRadius:6,fontSize:11,fontWeight:700,cursor:'pointer',border:'1.5px solid',borderColor:biz.gold_shield?'#c9a84c':'#2A2A35',background:biz.gold_shield?'rgba(201,168,76,0.1)':'#141418',color:biz.gold_shield?'#c9a84c':'#6B6B80',transition:'all 0.15s',opacity:toggling===biz.id+'-shield'?0.5:1}}>
                🛡 {biz.gold_shield?'Revoke':'Grant'}
              </button>
              <button onClick={()=>togglePro(biz)}
                style={{padding:'6px 12px',borderRadius:6,fontSize:11,fontWeight:700,cursor:'pointer',border:'1.5px solid',borderColor:biz.subscription_status==='active'?'#2d6a4f':'#2A2A35',background:biz.subscription_status==='active'?'rgba(45,106,79,0.1)':'#141418',color:biz.subscription_status==='active'?'#4CAF74':'#6B6B80',transition:'all 0.15s'}}>
                ★ {biz.subscription_status==='active'?'Revoke Pro':'Grant Pro'}
              </button>
              <Link href={`/business/${biz.slug}`} target="_blank" className="text-xs text-[var(--color-gold)] border border-[rgba(201,168,76,0.3)] px-3 py-1.5 rounded hover:border-[var(--color-gold)] transition-colors">View ↗</Link>
            </div>
          </div>
        ))}
        {filtered.length===0 && <div className="text-center py-12 text-[var(--color-text-secondary)]">{search?'No matches.':'No businesses yet.'}</div>}
      </div>

      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.65)',zIndex:100,overflowY:'auto',padding:'24px 16px'}} onClick={e=>{if(e.target===e.currentTarget)setShowForm(false)}}>
          <div style={{background:'#1C1C23',border:'1px solid #2A2A35',borderRadius:16,padding:32,maxWidth:640,margin:'0 auto',position:'relative'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:'#fff',margin:0}}>Add Business</h2>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#6B6B80',fontSize:20,cursor:'pointer'}}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div style={{background:'rgba(201,168,76,0.06)',border:'1px solid rgba(201,168,76,0.2)',borderRadius:8,padding:'14px 16px',marginBottom:20}}>
                <p style={{fontSize:11,fontWeight:700,color:'#c9a84c',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:12}}>Admin Options — goes live immediately</p>
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

              <div style={{marginBottom:14}}>
                <label style={LB}>Business Name *</label>
                <input required style={IS} placeholder="e.g. Mama's Southern Kitchen" value={form.name} onChange={e=>sf('name',e.target.value)} />
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
                <div><label style={LB}>Category *</label>
                  <select required style={IS} value={form.category} onChange={e=>sf('category',e.target.value)}>
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
              <div style={{marginBottom:14}}>
                <label style={LB}>Description</label>
                <textarea rows={3} style={{...IS,resize:'vertical',lineHeight:1.6}} placeholder="Tell the story of this business..." value={form.description} onChange={e=>sf('description',e.target.value)} />
              </div>
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
              <div style={{marginBottom:14}}><label style={LB}>Street Address</label><input style={IS} placeholder="246 Robert C Daniel Jr Pkwy" value={form.address} onChange={e=>sf('address',e.target.value)} /></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 80px 80px',gap:10,marginBottom:14}}>
                <div><label style={LB}>City *</label><input required style={IS} placeholder="Augusta" value={form.city} onChange={e=>sf('city',e.target.value)} /></div>
                <div><label style={LB}>Suite</label><input style={IS} placeholder="Ste 200" value={form.suite} onChange={e=>sf('suite',e.target.value)} /></div>
                <div><label style={LB}>State *</label><input required style={IS} maxLength={2} placeholder="GA" value={form.state} onChange={e=>sf('state',e.target.value.toUpperCase())} /></div>
                <div><label style={LB}>ZIP</label><input style={IS} maxLength={10} placeholder="30909" value={form.zip} onChange={e=>sf('zip',e.target.value)} /></div>
              </div>
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
              <div style={{display:'flex',gap:10}}>
                <button type="button" onClick={()=>setShowForm(false)} style={{flex:1,padding:'12px',background:'#141418',border:'1.5px solid #2A2A35',borderRadius:8,fontSize:13,fontWeight:600,color:'#A09D98',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>Cancel</button>
                <button type="submit" disabled={submitting||!form.name||!form.city||!form.state} style={{flex:2,padding:'12px',background:'#c9a84c',border:'none',borderRadius:8,fontSize:13,fontWeight:700,color:'#1a3a2a',cursor:submitting?'not-allowed':'pointer',opacity:submitting?0.7:1,fontFamily:"'DM Sans',sans-serif"}}>
                  {submitting?'Creating…':`Create & Publish${form.gold_shield?' 🛡':''}${form.subscription_status==='active'?' ★':''}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
