'use client'
import { useState, useRef, useCallback } from 'react'
import { CATEGORY_LABELS, BusinessCategory } from '@/types'

type PreviewRow = {
  _row: number
  _categoryWarning: string | null
  name: string; category: string
  address: string | null; city: string; state: string; zip: string | null
  phone: string | null; website: string | null; email: string | null
  description: string | null; lat: number | null; lng: number | null
}

type PreviewResult = {
  totalRows: number; validRows: number; skippedRows: number
  errors: string[]; preview: PreviewRow[]; allRows: PreviewRow[]
  colMap?: Record<string, string | null>; headers?: string[]; query?: string
}

type CommitResult = { inserted: number; failed: number; failedRows: { name: string; error: string }[] }
type InputMode = 'csv' | 'scrape'
type Stage = 'idle' | 'parsing' | 'scraping' | 'preview' | 'importing' | 'done'

const QUERY_TEMPLATES = [
  // Food & Dining
  'black owned restaurants in {city} {state}',
  'black owned soul food in {city} {state}',
  'black owned bakery in {city} {state}',
  'black owned catering in {city} {state}',
  'black owned food truck in {city} {state}',
  // Beauty & Wellness
  'black owned barbershops in {city} {state}',
  'black owned salons in {city} {state}',
  'black owned nail salon in {city} {state}',
  'black owned beauty supply in {city} {state}',
  'black owned spa in {city} {state}',
  'black owned esthetician in {city} {state}',
  'black owned facial in {city} {state}',
  'black owned lashes in {city} {state}',
  'black owned braids in {city} {state}',
  // Health & Medical
  'black owned dentists in {city} {state}',
  'black owned mental health in {city} {state}',
  'black owned physical therapy in {city} {state}',
  'black owned chiropractor in {city} {state}',
  'black owned pharmacy in {city} {state}',
  // Legal & Financial
  'black owned attorneys in {city} {state}',
  'black owned accounting in {city} {state}',
  'black owned tax preparation in {city} {state}',
  'black owned insurance in {city} {state}',
  'black owned mortgage in {city} {state}',
  'black owned financial advisors in {city} {state}',
  'black owned credit union in {city} {state}',
  // Home & Construction
  'black owned contractors in {city} {state}',
  'black owned plumber in {city} {state}',
  'black owned electrician in {city} {state}',
  'black owned cleaning service in {city} {state}',
  'black owned landscaping in {city} {state}',
  'black owned moving company in {city} {state}',
  'black owned roofing in {city} {state}',
  'black owned hvac in {city} {state}',
  // Automotive
  'black owned auto repair in {city} {state}',
  'black owned car wash in {city} {state}',
  'black owned auto detailing in {city} {state}',
  // Professional Services
  'black owned photography in {city} {state}',
  'black owned event planning in {city} {state}',
  'black owned marketing agency in {city} {state}',
  'black owned printing in {city} {state}',
  // Education & Childcare
  'black owned daycare in {city} {state}',
  'black owned tutoring in {city} {state}',
  // Retail & Products
  'black owned boutiques in {city} {state}',
  'black owned clothing store in {city} {state}',
  'black owned bookstore in {city} {state}',
  'black owned jewelry in {city} {state}',
  'black owned florist in {city} {state}',
  // Faith & Community
  'black owned church in {city} {state}',
  'black nonprofit in {city} {state}',
  // Real Estate
  'black owned real estate in {city} {state}',
  // Entertainment & Travel
  'black owned gym in {city} {state}',
  'black owned yoga studio in {city} {state}',
  'black owned dance studio in {city} {state}',
  'black owned hotel in {city} {state}',
  'black owned travel agency in {city} {state}',
  // Tech
  'black owned tech in {city} {state}',
  'black owned IT services in {city} {state}',
  // Veteran
  'black veteran owned business in {city} {state}',
]

const TOP_MARKETS = [
  { city: 'Atlanta', state: 'GA' },{ city: 'Houston', state: 'TX' },
  { city: 'Charlotte', state: 'NC' },{ city: 'Memphis', state: 'TN' },
  { city: 'Baltimore', state: 'MD' },{ city: 'Washington', state: 'DC' },
  { city: 'New Orleans', state: 'LA' },{ city: 'Jackson', state: 'MS' },
  { city: 'Augusta', state: 'GA' },{ city: 'Detroit', state: 'MI' },
  { city: 'Chicago', state: 'IL' },{ city: 'Philadelphia', state: 'PA' },
  { city: 'Dallas', state: 'TX' },{ city: 'Los Angeles', state: 'CA' },
  { city: 'New York', state: 'NY' },
]

const css: Record<string, React.CSSProperties> = {
  page:     { padding: '32px', maxWidth: 1100, margin: '0 auto' },
  card:     { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden', marginBottom: 20 },
  cardBody: { padding: '24px 28px' },
  label:    { fontSize: 11, fontWeight: 700, color: 'var(--color-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' as const, display: 'block', marginBottom: 8 },
  input:    { width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-charcoal)', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: 13, outline: 'none' },
  btn:      { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 6, fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', letterSpacing: '0.02em', transition: 'background 140ms, transform 80ms' },
  btnGold:  { background: 'var(--color-gold)', color: 'var(--color-midnight)' },
  btnGhost: { background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' },
  btnRed:   { background: '#c0392b', color: '#fff' },
  stat:     { background: 'var(--color-charcoal)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '16px 20px' },
  th:       { padding: '8px 12px', textAlign: 'left' as const, fontWeight: 600, fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase' as const, color: 'var(--color-muted)', borderBottom: '1px solid var(--color-border)', whiteSpace: 'nowrap' as const },
  td:       { padding: '8px 12px', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text)', verticalAlign: 'top' as const, fontSize: 12 },
  tdm:      { padding: '8px 12px', borderBottom: '1px solid var(--color-border)', color: 'var(--color-muted)', verticalAlign: 'top' as const, fontSize: 12 },
}

export function ImportBusinesses() {
  const [inputMode, setInputMode]       = useState<InputMode>('scrape')
  const [stage, setStage]               = useState<Stage>('idle')
  const [dragging, setDragging]         = useState(false)
  const [fileName, setFileName]         = useState('')

  // Scrape state
  const [scrapeQuery, setScrapeQuery]   = useState('black owned restaurants in Atlanta GA')
  const [scrapeCity, setScrapeCity]     = useState('Atlanta')
  const [scrapeState, setScrapeState]   = useState('GA')
  const [maxResults, setMaxResults]     = useState(20)
  const [selectedTemplate, setSelectedTemplate] = useState(0)

  // Shared state
  const [preview, setPreview]           = useState<PreviewResult | null>(null)
  const [skipGeocode, setSkipGeocode]   = useState(false)
  const [filterState, setFilterState]   = useState('')
  const [progress, setProgress]         = useState(0)
  const [error, setError]               = useState('')
  const [result, setResult]             = useState<CommitResult | null>(null)
  const [importedAt, setImportedAt]     = useState('')
  const [rolling, setRolling]           = useState(false)
  const [rollbackDone, setRollbackDone] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Update query when template/city/state changes
  function applyTemplate(tIdx: number, city: string, state: string) {
    const t = QUERY_TEMPLATES[tIdx]
    setScrapeQuery(t.replace('{city}', city).replace('{state}', state))
  }

  // CSV handlers
  const readFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') { setError('Please upload a CSV file.'); return }
    setError(''); setFileName(file.name); setStage('parsing')
    const reader = new FileReader()
    reader.onload = async (e) => {
      const text = e.target?.result as string
      try {
        const res = await fetch('/api/admin/import?action=preview', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csv: text }),
        })
        if (!res.ok) { setError('Failed to parse CSV.'); setStage('idle'); return }
        setPreview(await res.json()); setStage('preview')
      } catch { setError('Network error.'); setStage('idle') }
    }
    reader.readAsText(file)
  }, [])

  // Scrape handler
  async function handleScrape() {
    if (!scrapeQuery.trim()) return
    setError(''); setStage('scraping')
    try {
      const res = await fetch('/api/admin/scrape', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: scrapeQuery, maxResults }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Scrape failed'); setStage('idle'); return }
      const data = await res.json()
      setPreview(data); setStage('preview')
    } catch { setError('Network error during scrape.'); setStage('idle') }
  }

  // Commit handler
  async function handleCommit() {
    if (!preview) return
    setStage('importing'); setProgress(10)
    const rows = filterState ? preview.allRows.filter(r => r.state === filterState) : preview.allRows
    try {
      const res = await fetch('/api/admin/import?action=commit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows, geocode: !skipGeocode }),
      })
      setProgress(95)
      if (!res.ok) { setError('Import failed.'); setStage('preview'); return }
      const data: CommitResult = await res.json()
      setImportedAt(new Date().toISOString()); setResult(data); setProgress(100); setStage('done')
    } catch { setError('Network error.'); setStage('preview') }
  }

  // Rollback handler
  async function handleRollback() {
    if (!importedAt) return
    setRolling(true)
    try {
      const res = await fetch('/api/admin/import/rollback', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ importedAt }),
      })
      if (res.ok) setRollbackDone(true)
      else setError('Rollback failed')
    } catch { setError('Network error during rollback') }
    finally { setRolling(false) }
  }

  function reset() {
    setStage('idle'); setPreview(null); setResult(null); setFileName('')
    setError(''); setProgress(0); setFilterState('')
    setImportedAt(''); setRolling(false); setRollbackDone(false)
  }

  const visibleRows   = preview ? (filterState ? preview.preview.filter(r => r.state === filterState) : preview.preview) : []
  const allFiltered   = preview ? (filterState ? preview.allRows.filter(r => r.state === filterState) : preview.allRows) : []
  const uniqueStates  = preview ? [...new Set(preview.allRows.map(r => r.state))].sort() : []
  const stateCounts   = preview ? preview.allRows.reduce((a, r) => { a[r.state] = (a[r.state] ?? 0) + 1; return a }, {} as Record<string, number>) : {}
  const warnings      = preview?.preview.filter(r => r._categoryWarning).length ?? 0

  const Spinner = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  )

  return (
    <div style={css.page}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6, letterSpacing: '-0.02em' }}>Import Businesses</h1>
      <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 24 }}>Scrape Google Maps or upload a CSV — preview and confirm before importing.</p>

      {error && (
        <div style={{ background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 6, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#e74c3c' }}>{error}</div>
      )}

      {/* ── IDLE ── */}
      {stage === 'idle' && (
        <>
          {/* Mode tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: 24, gap: 0 }}>
            {(['scrape', 'csv'] as InputMode[]).map(m => (
              <button key={m} type="button" onClick={() => setInputMode(m)} style={{
                padding: '10px 22px', background: 'none', border: 'none',
                borderBottom: inputMode === m ? '2px solid var(--color-gold)' : '2px solid transparent',
                color: inputMode === m ? 'var(--color-gold)' : 'var(--color-muted)',
                fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', marginBottom: -1, transition: 'color 140ms',
              }}>
                {m === 'scrape' ? 'Scrape Google Maps' : 'Upload CSV'}
              </button>
            ))}
          </div>

          {/* SCRAPE tab */}
          {inputMode === 'scrape' && (
            <div style={css.card}>
              <div style={css.cardBody}>
                <p style={css.label}>Quick templates</p>
                {/* City + State pickers */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                  <select value={`${scrapeCity}|${scrapeState}`}
                    onChange={e => {
                      const [c, s] = e.target.value.split('|')
                      setScrapeCity(c); setScrapeState(s)
                      applyTemplate(selectedTemplate, c, s)
                    }}
                    style={{ ...css.input, width: 'auto', flex: 1, minWidth: 160 }}>
                    {TOP_MARKETS.map(m => (
                      <option key={`${m.city}|${m.state}`} value={`${m.city}|${m.state}`}>{m.city}, {m.state}</option>
                    ))}
                  </select>
                  <select value={selectedTemplate}
                    onChange={e => {
                      const idx = Number(e.target.value)
                      setSelectedTemplate(idx)
                      applyTemplate(idx, scrapeCity, scrapeState)
                    }}
                    style={{ ...css.input, width: 'auto', flex: 2, minWidth: 200 }}>
                    {QUERY_TEMPLATES.map((t, i) => (
                      <option key={i} value={i}>{t.replace('{city}', scrapeCity).replace('{state}', scrapeState)}</option>
                    ))}
                  </select>
                </div>

                {/* Query input */}
                <p style={{ ...css.label, marginTop: 16 }}>Search query</p>
                <input
                  type="text"
                  value={scrapeQuery}
                  onChange={e => setScrapeQuery(e.target.value)}
                  placeholder='e.g. "black owned restaurants in Atlanta GA"'
                  style={{ ...css.input, marginBottom: 16, fontSize: 14 }}
                />

                {/* Max results */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                  <div style={{ flex: 1 }}>
                    <p style={css.label}>Max results</p>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {[20, 50, 100, 200].map(n => (
                        <button key={n} type="button" onClick={() => setMaxResults(n)} style={{
                          padding: '6px 14px', borderRadius: 5, border: '1px solid',
                          borderColor: maxResults === n ? 'var(--color-gold)' : 'var(--color-border)',
                          background: maxResults === n ? 'rgba(201,168,76,0.1)' : 'transparent',
                          color: maxResults === n ? 'var(--color-gold)' : 'var(--color-muted)',
                          fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        }}>{n}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)', lineHeight: 1.5 }}>
                    ~${(maxResults * 0.004).toFixed(2)} estimated cost<br />
                    <span style={{ color: 'var(--color-muted)', fontSize: 11 }}>$0.004 / result</span>
                  </div>
                </div>

                <button type="button" onClick={handleScrape} disabled={!scrapeQuery.trim()} style={{ ...css.btn, ...css.btnGold, width: '100%', justifyContent: 'center' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#b8943e' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-gold)' }}
                  onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)' }}
                  onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
                >
                  Run Scrape →
                </button>
              </div>
            </div>
          )}

          {/* CSV tab */}
          {inputMode === 'csv' && (
            <div style={css.card}>
              <div style={css.cardBody}>
                <div
                  style={{ border: '2px dashed var(--color-border)', borderRadius: 8, padding: '48px 24px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 150ms', borderColor: dragging ? 'var(--color-gold)' : undefined, background: dragging ? 'rgba(201,168,76,0.04)' : undefined }}
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) readFile(f) }}
                  onClick={() => fileRef.current?.click()}
                >
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="1.5" strokeLinecap="round" style={{ margin: '0 auto 12px', display: 'block' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>Drop CSV here or click to browse</p>
                  <p style={{ fontSize: 12, color: 'var(--color-muted)' }}>Required: name, city, state · Optional: address, phone, website, category, lat, lng</p>
                </div>
                <input ref={fileRef} type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f) }} />
              </div>
            </div>
          )}
        </>
      )}

      {/* ── SCRAPING ── */}
      {stage === 'scraping' && (
        <div style={{ ...css.card, ...css.cardBody }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Spinner />
            <span style={{ fontSize: 14, color: 'var(--color-text)' }}>Scraping Google Maps for "{scrapeQuery}"...</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 8 }}>This usually takes 15–60 seconds depending on result count.</p>
        </div>
      )}

      {/* ── PARSING ── */}
      {stage === 'parsing' && (
        <div style={{ ...css.card, ...css.cardBody, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Spinner />
          <span style={{ fontSize: 14, color: 'var(--color-text)' }}>Parsing {fileName}...</span>
        </div>
      )}

      {/* ── PREVIEW ── */}
      {(stage === 'preview' || stage === 'importing') && preview && (
        <>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { n: preview.totalRows,   l: 'Total results', c: 'var(--color-gold)' },
              { n: preview.validRows,   l: 'Valid',          c: '#3cb371' },
              { n: preview.skippedRows, l: 'Skipped',        c: preview.skippedRows > 0 ? '#e74c3c' : 'var(--color-muted)' },
              { n: warnings,            l: 'Cat. warnings',  c: warnings > 0 ? 'var(--color-gold)' : 'var(--color-muted)' },
            ].map(({ n, l, c }) => (
              <div key={l} style={css.stat}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: c, lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Source badge */}
          {preview.query && (
            <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 6, padding: '8px 14px', marginBottom: 16, fontSize: 12, color: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Scraped: "{preview.query}"
            </div>
          )}

          {preview.errors.length > 0 && (
            <div style={{ ...css.card, borderColor: 'rgba(192,57,43,0.3)', marginBottom: 16 }}>
              <div style={{ ...css.cardBody, maxHeight: 100, overflowY: 'auto' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#e74c3c', marginBottom: 6 }}>Skipped rows</p>
                {preview.errors.map((e, i) => <div key={i} style={{ fontSize: 12, color: '#e74c3c' }}>{e}</div>)}
              </div>
            </div>
          )}

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
            <select value={filterState} onChange={e => setFilterState(e.target.value)}
              style={{ ...css.input, width: 'auto' }}>
              <option value="">All states ({preview.validRows})</option>
              {uniqueStates.map(st => <option key={st} value={st}>{st} ({stateCounts[st]})</option>)}
            </select>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
              <input type="checkbox" checked={skipGeocode} onChange={e => setSkipGeocode(e.target.checked)} />
              Skip geocoding
              {inputMode === 'scrape' && <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>(coords already included)</span>}
            </label>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button style={{ ...css.btn, ...css.btnGhost }} onClick={reset} disabled={stage === 'importing'}>
                ← Back
              </button>
              <button style={{ ...css.btn, ...css.btnGold, opacity: stage === 'importing' ? 0.7 : 1 }} onClick={handleCommit} disabled={stage === 'importing'}
                onMouseEnter={e => { if (stage !== 'importing') (e.currentTarget as HTMLButtonElement).style.background = '#b8943e' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-gold)' }}
                onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)' }}
                onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
              >
                {stage === 'importing' ? <><Spinner /> Importing...</> : <>Import {allFiltered.length.toLocaleString()} businesses</>}
              </button>
            </div>
          </div>

          {stage === 'importing' && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ height: 5, borderRadius: 3, background: 'var(--color-border)', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--color-gold)', transition: 'width 300ms', width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Table */}
          <div style={{ ...css.card, padding: 0 }}>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>
                Preview — {Math.min(visibleRows.length, 200)} of {allFiltered.length} results
              </span>
              {inputMode === 'scrape' && (
                <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>Lat/lng pre-populated from Google Maps</span>
              )}
            </div>
            <div style={{ overflowX: 'auto', maxHeight: 480, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead style={{ position: 'sticky', top: 0, background: 'var(--color-charcoal)', zIndex: 1 }}>
                  <tr>
                    {['#','Name','Category','City','State','Phone','Website','Coords'].map(h => (
                      <th key={h} style={css.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                      <td style={css.tdm}>{row._row}</td>
                      <td style={css.td}>
                        <span style={{ fontWeight: 500 }}>{row.name}</span>
                        {row._categoryWarning && <div style={{ fontSize: 10, color: 'var(--color-gold)', marginTop: 2 }}>{row._categoryWarning}</div>}
                      </td>
                      <td style={css.td}>
                        <span style={{ background: 'rgba(201,168,76,0.1)', color: 'var(--color-gold)', padding: '2px 7px', borderRadius: 3, fontSize: 11, fontWeight: 600 }}>
                          {CATEGORY_LABELS[row.category as BusinessCategory] ?? row.category}
                        </span>
                      </td>
                      <td style={css.td}>{row.city}</td>
                      <td style={css.td}>{row.state}</td>
                      <td style={css.tdm}>{row.phone ?? <span style={{ color: 'var(--color-border)' }}>—</span>}</td>
                      <td style={css.tdm}>{row.website ? <span style={{ color: 'var(--color-gold)', fontSize: 11 }}>Yes</span> : <span style={{ color: 'var(--color-border)' }}>—</span>}</td>
                      <td style={css.tdm}>{row.lat != null ? <span style={{ color: '#3cb371', fontSize: 11 }}>Yes</span> : <span style={{ color: 'var(--color-border)' }}>No</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── DONE ── */}
      {stage === 'done' && result && (
        <div style={{ ...css.card, textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(46,139,87,0.15)', border: '1px solid rgba(46,139,87,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3cb371" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8, letterSpacing: '-0.01em' }}>Import complete</p>
          <p style={{ fontSize: 15, color: 'var(--color-muted)', marginBottom: 24 }}>
            <strong style={{ color: '#3cb371' }}>{result.inserted.toLocaleString()}</strong> businesses added
            {result.failed > 0 && <>, <strong style={{ color: '#e74c3c' }}>{result.failed}</strong> failed</>}
          </p>

          {result.failedRows.length > 0 && (
            <div style={{ textAlign: 'left', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 6, padding: '12px 16px', marginBottom: 20, maxHeight: 140, overflowY: 'auto' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#e74c3c', marginBottom: 6 }}>Failed rows</p>
              {result.failedRows.map((r, i) => <div key={i} style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 3 }}><strong>{r.name}</strong>: {r.error}</div>)}
            </div>
          )}

          {!rollbackDone ? (
            <div style={{ marginBottom: 20 }}>
              <button onClick={handleRollback} disabled={rolling} style={{ ...css.btn, ...css.btnRed, opacity: rolling ? 0.7 : 1 }}
                onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)' }}
                onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
              >
                {rolling ? <><Spinner /> Rolling back...</> : <>↩ Undo this import</>}
              </button>
              <p style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 6 }}>Removes all {result.inserted} businesses just imported. Only works this session.</p>
            </div>
          ) : (
            <div style={{ background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 6, padding: '12px 20px', marginBottom: 20, fontSize: 13, color: '#e74c3c', fontWeight: 600 }}>
              Import rolled back. All inserted businesses removed.
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button style={{ ...css.btn, ...css.btnGold }} onClick={reset}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#b8943e' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-gold)' }}
            >
              Run another scrape
            </button>
            <a href="/search" style={{ ...css.btn, ...css.btnGhost, textDecoration: 'none' }}>View in directory</a>
          </div>
        </div>
      )}
    </div>
  )
}
