'use client'
import { useState, useRef } from 'react'

const CATEGORIES: { label: string; query: string }[] = [
  { label: 'Restaurants / Soul Food',      query: 'black owned restaurants in {city} {state}' },
  { label: 'Barbershops',                  query: 'black owned barbershops in {city} {state}' },
  { label: 'Salons / Hair',                query: 'black owned hair salons in {city} {state}' },
  { label: 'Nail Salons',                  query: 'black owned nail salons in {city} {state}' },
  { label: 'Beauty Supply',                query: 'black owned beauty supply in {city} {state}' },
  { label: 'Spas / Estheticians',          query: 'black owned spa esthetician in {city} {state}' },
  { label: 'Attorneys / Legal',            query: 'black owned attorneys in {city} {state}' },
  { label: 'Financial / Tax / Accounting', query: 'black owned accounting tax in {city} {state}' },
  { label: 'Contractors / Home Services',  query: 'black owned contractors in {city} {state}' },
  { label: 'Auto Repair',                  query: 'black owned auto repair in {city} {state}' },
  { label: 'Dentists',                     query: 'black owned dentists in {city} {state}' },
  { label: 'Daycares / Childcare',         query: 'black owned daycare childcare in {city} {state}' },
  { label: 'Gyms / Fitness',               query: 'black owned gyms fitness in {city} {state}' },
  { label: 'Boutiques / Clothing',         query: 'black owned boutiques clothing in {city} {state}' },
  { label: 'Mental Health / Therapy',      query: 'black owned mental health therapy in {city} {state}' },
  { label: 'Real Estate',                  query: 'black owned real estate in {city} {state}' },
  { label: 'Photography / Events',         query: 'black owned photography event planning in {city} {state}' },
  { label: 'Cleaning Services',            query: 'black owned cleaning services in {city} {state}' },
  { label: 'Moving Companies',             query: 'black owned moving company in {city} {state}' },
  { label: 'Catering / Bakeries',          query: 'black owned catering bakery in {city} {state}' },
]

const MARKETS: { city: string; state: string }[] = [
  { city:'Atlanta',      state:'GA' },{ city:'Augusta',       state:'GA' },
  { city:'Houston',      state:'TX' },{ city:'Charlotte',     state:'NC' },
  { city:'Memphis',      state:'TN' },{ city:'Baltimore',     state:'MD' },
  { city:'Washington',   state:'DC' },{ city:'New Orleans',   state:'LA' },
  { city:'Jackson',      state:'MS' },{ city:'Detroit',       state:'MI' },
  { city:'Chicago',      state:'IL' },{ city:'Philadelphia',  state:'PA' },
  { city:'Dallas',       state:'TX' },{ city:'Los Angeles',   state:'CA' },
  { city:'New York',     state:'NY' },{ city:'Miami',         state:'FL' },
  { city:'Birmingham',   state:'AL' },{ city:'Nashville',     state:'TN' },
  { city:'Richmond',     state:'VA' },{ city:'Columbus',      state:'OH' },
]

type JobStatus = 'pending' | 'running' | 'done' | 'error'
type Job = { query: string; city: string; state: string; label: string; status: JobStatus; found?: number; error?: string }

type Stage = 'config' | 'running' | 'done'

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', cursor: 'pointer', borderRadius: 5, transition: 'background 120ms', background: checked ? 'rgba(201,168,76,0.08)' : 'transparent' }}
      onMouseEnter={e => { if (!checked) (e.currentTarget as HTMLLabelElement).style.background = 'rgba(255,255,255,0.04)' }}
      onMouseLeave={e => { if (!checked) (e.currentTarget as HTMLLabelElement).style.background = 'transparent' }}
    >
      <div style={{ width: 16, height: 16, borderRadius: 3, border: `2px solid ${checked ? 'var(--color-gold)' : 'var(--color-border)'}`, background: checked ? 'var(--color-gold)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 140ms' }}>
        {checked && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--color-midnight)" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>}
      </div>
      <span style={{ fontSize: 13, color: checked ? 'var(--color-text)' : 'var(--color-text-secondary)', fontWeight: checked ? 500 : 400 }}>{label}</span>
    </label>
  )
}

function StatusDot({ status }: { status: JobStatus }) {
  const colors: Record<JobStatus, string> = { pending: 'var(--color-border)', running: 'var(--color-gold)', done: '#3cb371', error: '#e74c3c' }
  return (
    <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors[status], flexShrink: 0, transition: 'background 200ms', boxShadow: status === 'running' ? `0 0 0 3px rgba(201,168,76,0.25)` : 'none' }} />
  )
}

export function BatchScrape() {
  const [stage, setStage]             = useState<Stage>('config')
  const [selCats, setSelCats]         = useState<number[]>([0,1,2,3,4,6,7,8,9,10,11])
  const [selMarkets, setSelMarkets]   = useState<number[]>([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14])
  const [maxResults, setMaxResults]   = useState(100)
  const [jobs, setJobs]               = useState<Job[]>([])
  const [completed, setCompleted]     = useState(0)
  const [totalFound, setTotalFound]   = useState(0)
  const [totalDeduped, setTotalDeduped] = useState(0)
  const [csvData, setCsvData]         = useState('')
  const [error, setError]             = useState('')
  const abortRef = useRef<AbortController | null>(null)

  const selectedCats    = CATEGORIES.filter((_, i) => selCats.includes(i))
  const selectedMarkets = MARKETS.filter((_, i) => selMarkets.includes(i))
  const totalJobs       = selectedCats.length * selectedMarkets.length
  const estCost         = (totalJobs * maxResults * 0.004).toFixed(2)
  const estResults      = totalJobs * maxResults

  function buildJobs(): Job[] {
    const jobs: Job[] = []
    for (const market of selectedMarkets) {
      for (const cat of selectedCats) {
        jobs.push({
          query: cat.query.replace('{city}', market.city).replace('{state}', market.state),
          city: market.city, state: market.state, label: cat.label,
          status: 'pending',
        })
      }
    }
    return jobs
  }

  async function handleStart() {
    const jobList = buildJobs()
    setJobs(jobList)
    setStage('running')
    setCompleted(0); setTotalFound(0); setTotalDeduped(0); setCsvData(''); setError('')

    abortRef.current = new AbortController()
    const allRows: any[] = []

    for (let i = 0; i < jobList.length; i++) {
      // Check if aborted
      if (abortRef.current.signal.aborted) break

      const job = jobList[i]

      // Mark current job as running
      setJobs(prev => prev.map((j, idx) => idx === i ? { ...j, status: 'running' } : j))

      try {
        const res = await fetch('/api/admin/batch-scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: job.query, city: job.city, state: job.state, maxResults }),
          signal: abortRef.current.signal,
        })

        if (!res.ok) {
          const d = await res.json().catch(() => ({}))
          setJobs(prev => prev.map((j, idx) => idx === i ? { ...j, status: 'error', error: d.error ?? `HTTP ${res.status}` } : j))
        } else {
          const data = await res.json()
          const rows = data.rows ?? []
          allRows.push(...rows)
          setJobs(prev => prev.map((j, idx) => idx === i ? { ...j, status: 'done', found: rows.length } : j))
          setTotalFound(allRows.length)
        }
      } catch (e: any) {
        if (e.name === 'AbortError') break
        setJobs(prev => prev.map((j, idx) => idx === i ? { ...j, status: 'error', error: e.message } : j))
      }

      setCompleted(i + 1)
    }

    // Deduplicate by phone, then build CSV
    const seen    = new Set<string>()
    const deduped = allRows.filter(r => {
      const key = r.phone || `${r.name}|${r.city}|${r.state}`
      if (seen.has(key)) return false
      seen.add(key); return true
    })

    setTotalDeduped(deduped.length)
    setCsvData(buildCSV(deduped))
    setStage('done')
  }

  function buildCSV(rows: any[]): string {
    const headers = ['name','category','address','city','state','zip','phone','website','lat','lng','source','geo_match']
    const escape  = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`
    return [headers.join(','), ...rows.map(r => headers.map(h => escape(r[h])).join(','))].join('\n')
  }

  function handleAbort() {
    abortRef.current?.abort()
    // Don't reset to config — stay on running so user sees progress,
    // then the loop will finish current job and land on done with partial results
  }

  function downloadCSV() {
    const blob = new Blob([csvData], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `district1921-batch-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const progress = totalJobs > 0 ? (completed / totalJobs) * 100 : 0
  const doneJobs  = jobs.filter(j => j.status === 'done')
  const errorJobs = jobs.filter(j => j.status === 'error')

  const s: Record<string, React.CSSProperties> = {
    page:  { padding: '32px', maxWidth: 1100, margin: '0 auto' },
    h1:    { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6, letterSpacing: '-0.02em' },
    card:  { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '22px 24px', marginBottom: 20 },
    head:  { fontSize: 11, fontWeight: 700, color: 'var(--color-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    btn:   { display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 22px', borderRadius: 6, fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', letterSpacing: '0.03em', transition: 'background 140ms, transform 80ms' },
    gold:  { background: 'var(--color-gold)', color: 'var(--color-midnight)' },
    ghost: { background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' },
    red:   { background: '#c0392b', color: '#fff' },
    green: { background: '#27ae60', color: '#fff' },
  }

  return (
    <div style={s.page}>
      <h1 style={s.h1}>Batch Scrape</h1>
      <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 28 }}>
        Scrape multiple categories across multiple markets in one run. Results are deduplicated and exported as a CSV ready to import.
      </p>

      {error && <div style={{ background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 6, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#e74c3c' }}>{error}</div>}

      {/* CONFIG */}
      {stage === 'config' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

            {/* Categories */}
            <div style={s.card}>
              <div style={s.head}>
                <span>Categories ({selCats.length} selected)</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => setSelCats(CATEGORIES.map((_,i)=>i))} style={{ fontSize: 11, color: 'var(--color-gold)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>All</button>
                  <button type="button" onClick={() => setSelCats([])} style={{ fontSize: 11, color: 'var(--color-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>None</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                {CATEGORIES.map((c, i) => (
                  <CheckRow key={i} label={c.label} checked={selCats.includes(i)} onChange={v => setSelCats(v ? [...selCats, i] : selCats.filter(x => x !== i))} />
                ))}
              </div>
            </div>

            {/* Markets */}
            <div style={s.card}>
              <div style={s.head}>
                <span>Markets ({selMarkets.length} selected)</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => setSelMarkets(MARKETS.map((_,i)=>i))} style={{ fontSize: 11, color: 'var(--color-gold)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>All</button>
                  <button type="button" onClick={() => setSelMarkets([])} style={{ fontSize: 11, color: 'var(--color-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>None</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                {MARKETS.map((m, i) => (
                  <CheckRow key={i} label={`${m.city}, ${m.state}`} checked={selMarkets.includes(i)} onChange={v => setSelMarkets(v ? [...selMarkets, i] : selMarkets.filter(x => x !== i))} />
                ))}
              </div>
            </div>
          </div>

          {/* Settings + summary */}
          <div style={{ ...s.card, display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Results per run</p>
              <div style={{ display: 'flex', gap: 6 }}>
                {[20,50,100,200].map(n => (
                  <button key={n} type="button" onClick={() => setMaxResults(n)} style={{ padding: '6px 14px', borderRadius: 5, border: '1px solid', borderColor: maxResults === n ? 'var(--color-gold)' : 'var(--color-border)', background: maxResults === n ? 'rgba(201,168,76,0.1)' : 'transparent', color: maxResults === n ? 'var(--color-gold)' : 'var(--color-muted)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{n}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 28 }}>
              {[
                { label: 'Total runs',    value: totalJobs.toLocaleString() },
                { label: 'Max results',   value: estResults.toLocaleString() },
                { label: 'Est. cost',     value: `~$${estCost}` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-gold)', lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 3 }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ marginLeft: 'auto' }}>
              <button type="button" onClick={handleStart} disabled={totalJobs === 0} style={{ ...s.btn, ...s.gold, fontSize: 14, padding: '12px 28px', opacity: totalJobs === 0 ? 0.5 : 1 }}
                onMouseEnter={e => { if (totalJobs > 0) (e.currentTarget as HTMLButtonElement).style.background = '#b8943e' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-gold)' }}
                onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)' }}
                onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
              >
                Start Batch Scrape
              </button>
            </div>
          </div>
        </>
      )}

      {/* RUNNING */}
      {stage === 'running' && (
        <>
          {/* Progress header */}
          <div style={{ ...s.card, padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>
                  Running — {completed} of {totalJobs} jobs complete
                </span>
                <span style={{ fontSize: 12, color: 'var(--color-muted)', marginLeft: 12 }}>
                  {totalFound.toLocaleString()} businesses found so far
                </span>
              </div>
              <button type="button" onClick={handleAbort} style={{ ...s.btn, ...s.red, padding: '7px 16px', fontSize: 12 }}>
                Stop
              </button>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: 'var(--color-border)', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--color-gold)', borderRadius: 3, transition: 'width 400ms var(--ease-out)', width: `${progress}%` }} />
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 10, fontSize: 12, color: 'var(--color-muted)' }}>
              <span style={{ color: '#3cb371' }}>&#10003; {doneJobs.length} done</span>
              {errorJobs.length > 0 && <span style={{ color: '#e74c3c' }}>&#33; {errorJobs.length} errors</span>}
              <span>{totalJobs - completed} remaining</span>
            </div>
          </div>

          {/* Job list */}
          <div style={{ ...s.card, padding: 0, maxHeight: 520, overflowY: 'auto' }}>
            {jobs.map((job, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderBottom: '1px solid var(--color-border)', background: job.status === 'running' ? 'rgba(201,168,76,0.04)' : 'transparent' }}>
                <StatusDot status={job.status} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 12, color: job.status === 'done' ? 'var(--color-text)' : job.status === 'error' ? '#e74c3c' : 'var(--color-muted)', fontWeight: job.status === 'running' ? 600 : 400 }}>
                    {job.label} — {job.city}, {job.state}
                  </span>
                  {job.error && <div style={{ fontSize: 11, color: '#e74c3c', marginTop: 2 }}>{job.error}</div>}
                </div>
                {job.found != null && (
                  <span style={{ fontSize: 11, color: '#3cb371', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {job.found} found
                  </span>
                )}
                {job.status === 'running' && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="2" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                )}
                {job.status === 'pending' && <div style={{ width: 13 }} />}
              </div>
            ))}
          </div>
        </>
      )}

      {/* DONE */}
      {stage === 'done' && (
        <div style={{ ...s.card, textAlign: 'center', padding: '52px 32px' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(46,139,87,0.12)', border: '1px solid rgba(46,139,87,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3cb371" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>

          <p style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8, letterSpacing: '-0.01em' }}>
            Batch scrape complete
          </p>

          <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginBottom: 32 }}>
            {[
              { label: 'Jobs run',      value: jobs.length },
              { label: 'Raw results',   value: totalFound.toLocaleString() },
              { label: 'After dedup',   value: totalDeduped.toLocaleString() },
              { label: 'Errors',        value: errorJobs.length, color: errorJobs.length > 0 ? '#e74c3c' : undefined },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: color ?? 'var(--color-gold)', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 28, lineHeight: 1.65 }}>
            Download the CSV, then upload it in the <strong style={{ color: 'var(--color-text)' }}>Import</strong> page to preview and push to the database.
            <br />Duplicates have been removed by phone number.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" onClick={downloadCSV} style={{ ...s.btn, ...s.gold, fontSize: 14, padding: '12px 28px' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#b8943e' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-gold)' }}
              onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)' }}
              onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download CSV ({totalDeduped.toLocaleString()} businesses)
            </button>
            <a href="/admin/import" style={{ ...s.btn, ...s.ghost, textDecoration: 'none' }}>
              Go to Import
            </a>
            <button type="button" onClick={() => setStage('config')} style={{ ...s.btn, ...s.ghost }}>
              Run another batch
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
