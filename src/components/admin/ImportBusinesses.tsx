'use client'
import { useState, useRef, useCallback } from 'react'
import { CATEGORY_LABELS, BusinessCategory } from '@/types'

type PreviewRow = {
  _row: number
  _categoryWarning: string | null
  name: string
  category: string
  address: string | null
  city: string
  state: string
  zip: string | null
  phone: string | null
  website: string | null
  email: string | null
  description: string | null
  lat: number | null
  lng: number | null
}

type PreviewResult = {
  colMap: Record<string, string | null>
  headers: string[]
  totalRows: number
  validRows: number
  skippedRows: number
  errors: string[]
  preview: PreviewRow[]
  allRows: PreviewRow[]
}

type CommitResult = {
  inserted: number
  failed: number
  failedRows: { name: string; error: string }[]
}

type Stage = 'idle' | 'parsing' | 'preview' | 'geocoding' | 'importing' | 'done'

const s: Record<string, React.CSSProperties> = {
  page:      { padding: '32px', maxWidth: 1100, margin: '0 auto' },
  h1:        { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6, letterSpacing: '-0.02em' },
  sub:       { fontSize: 13, color: 'var(--color-muted)', marginBottom: 32 },
  card:      { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '24px 28px', marginBottom: 20 },
  label:     { fontSize: 12, fontWeight: 600, color: 'var(--color-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' as const, display: 'block', marginBottom: 8 },
  dropzone:  { border: '2px dashed var(--color-border)', borderRadius: 8, padding: '48px 24px', textAlign: 'center' as const, cursor: 'pointer', transition: 'border-color 150ms, background 150ms' },
  btn:       { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 6, fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', letterSpacing: '0.02em', transition: 'background 140ms, transform 80ms' },
  btnPrimary:{ background: 'var(--color-gold)', color: 'var(--color-midnight)' },
  btnGhost:  { background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' },
  btnDanger: { background: '#c0392b', color: '#fff' },
  tag:       { display: 'inline-block', padding: '2px 8px', borderRadius: 3, fontSize: 11, fontWeight: 600, letterSpacing: '0.03em' },
  tagWarn:   { background: 'rgba(201,168,76,0.15)', color: 'var(--color-gold)' },
  tagOk:     { background: 'rgba(46,139,87,0.15)', color: '#3cb371' },
  tagErr:    { background: 'rgba(192,57,43,0.12)', color: '#e74c3c' },
  table:     { width: '100%', borderCollapse: 'collapse' as const, fontSize: 12 },
  th:        { padding: '8px 12px', textAlign: 'left' as const, fontWeight: 600, fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase' as const, color: 'var(--color-muted)', borderBottom: '1px solid var(--color-border)', whiteSpace: 'nowrap' as const },
  td:        { padding: '8px 12px', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text)', verticalAlign: 'top' as const },
  tdMuted:   { padding: '8px 12px', borderBottom: '1px solid var(--color-border)', color: 'var(--color-muted)', verticalAlign: 'top' as const },
  statBox:   { background: 'var(--color-charcoal)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '16px 20px', display: 'flex', flexDirection: 'column' as const, gap: 4 },
  statNum:   { fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--color-gold)', lineHeight: 1 },
  statLbl:   { fontSize: 12, color: 'var(--color-muted)' },
  progress:  { height: 6, borderRadius: 3, background: 'var(--color-border)', overflow: 'hidden', marginTop: 12 },
  progressBar:{ height: '100%', background: 'var(--color-gold)', transition: 'width 300ms' },
}

export function ImportBusinesses() {
  const [stage, setStage]               = useState<Stage>('idle')
  const [dragging, setDragging]         = useState(false)
  const [fileName, setFileName]         = useState('')
  const [csvText, setCsvText]           = useState('')
  const [preview, setPreview]           = useState<PreviewResult | null>(null)
  const [skipGeocode, setSkipGeocode]   = useState(false)
  const [progress, setProgress]         = useState(0)
  const [progressMsg, setProgressMsg]   = useState('')
  const [result, setResult]             = useState<CommitResult | null>(null)
  const [importedAt, setImportedAt]       = useState<string>('')
  const [rolling, setRolling]             = useState(false)
  const [rollbackDone, setRollbackDone]   = useState(false)
  const [filterState, setFilterState]   = useState('')
  const [error, setError]               = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const readFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setError('Please upload a CSV file.')
      return
    }
    setError('')
    setFileName(file.name)
    setStage('parsing')
    const reader = new FileReader()
    reader.onload = async (e) => {
      const text = e.target?.result as string
      setCsvText(text)
      await parseCSV(text)
    }
    reader.readAsText(file)
  }, [])

  const parseCSV = async (text: string) => {
    setStage('parsing')
    try {
      const res = await fetch('/api/admin/import?action=preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv: text }),
      })
      if (!res.ok) { setError('Failed to parse CSV.'); setStage('idle'); return }
      const data: PreviewResult = await res.json()
      setPreview(data)
      setStage('preview')
    } catch (e) {
      setError('Network error parsing CSV.')
      setStage('idle')
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) readFile(file)
  }, [readFile])

  const handleCommit = async () => {
    if (!preview) return
    setStage('importing')
    setProgress(0)
    setProgressMsg('Starting import...')

    const rows = filterState
      ? preview.allRows.filter(r => r.state === filterState)
      : preview.allRows

    setProgressMsg(`Importing ${rows.length} businesses${skipGeocode ? '' : ' with geocoding'}...`)
    setProgress(10)

    try {
      const res = await fetch('/api/admin/import?action=commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows, geocode: !skipGeocode }),
      })
      setProgress(95)
      if (!res.ok) { setError('Import failed.'); setStage('preview'); return }
      const data: CommitResult = await res.json()
      setImportedAt(new Date().toISOString())
      setResult(data)
      setProgress(100)
      setStage('done')
    } catch (e) {
      setError('Network error during import.')
      setStage('preview')
    }
  }

  const reset = () => {
    setStage('idle'); setPreview(null); setResult(null)
    setFileName(''); setCsvText(''); setError('')
    setProgress(0); setFilterState('')
    setImportedAt(''); setRolling(false); setRollbackDone(false)
  }

  const handleRollback = async () => {
    if (!importedAt) return
    setRolling(true)
    try {
      const res = await fetch('/api/admin/import/rollback', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ importedAt }),
      })
      const data = await res.json()
      if (res.ok) setRollbackDone(true)
      else setError(data.error ?? 'Rollback failed')
    } catch {
      setError('Network error during rollback')
    } finally {
      setRolling(false)
    }
  }

  const visibleRows = preview
    ? (filterState ? preview.preview.filter(r => r.state === filterState) : preview.preview)
    : []

  const allFilteredRows = preview
    ? (filterState ? preview.allRows.filter(r => r.state === filterState) : preview.allRows)
    : []

  const uniqueStates = preview
    ? [...new Set(preview.allRows.map(r => r.state))].sort()
    : []

  const stateCounts = preview
    ? preview.allRows.reduce((acc, r) => { acc[r.state] = (acc[r.state] ?? 0) + 1; return acc }, {} as Record<string, number>)
    : {}

  const warnings = preview?.preview.filter(r => r._categoryWarning).length ?? 0

  return (
    <div style={s.page}>
      <h1 style={s.h1}>Import Businesses</h1>
      <p style={s.sub}>Upload a CSV of scraped business data. Preview and confirm before committing to the database.</p>

      {error && (
        <div style={{ background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 6, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#e74c3c' }}>
          {error}
        </div>
      )}

      {/* IDLE — upload zone */}
      {stage === 'idle' && (
        <div style={s.card}>
          <span style={s.label}>Upload CSV</span>
          <div
            style={{ ...s.dropzone, borderColor: dragging ? 'var(--color-gold)' : undefined, background: dragging ? 'rgba(201,168,76,0.05)' : undefined }}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="1.5" strokeLinecap="round" style={{ margin: '0 auto', display: 'block' }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>
              Drop your CSV here or click to browse
            </p>
            <p style={{ fontSize: 12, color: 'var(--color-muted)' }}>
              Required columns: <strong>name, city, state</strong> &nbsp;·&nbsp; Optional: address, zip, phone, website, email, description, category, lat, lng
            </p>
          </div>
          <input ref={fileRef} type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f) }} />
        </div>
      )}

      {/* PARSING */}
      {stage === 'parsing' && (
        <div style={s.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="2" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            <span style={{ fontSize: 14, color: 'var(--color-text)' }}>Parsing {fileName}...</span>
          </div>
        </div>
      )}

      {/* PREVIEW */}
      {(stage === 'preview' || stage === 'importing') && preview && (
        <>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            <div style={s.statBox}>
              <span style={s.statNum}>{preview.totalRows}</span>
              <span style={s.statLbl}>Total rows</span>
            </div>
            <div style={s.statBox}>
              <span style={{ ...s.statNum, color: '#3cb371' }}>{preview.validRows}</span>
              <span style={s.statLbl}>Valid</span>
            </div>
            <div style={s.statBox}>
              <span style={{ ...s.statNum, color: preview.skippedRows > 0 ? '#e74c3c' : 'var(--color-muted)' }}>{preview.skippedRows}</span>
              <span style={s.statLbl}>Skipped</span>
            </div>
            <div style={s.statBox}>
              <span style={{ ...s.statNum, color: warnings > 0 ? 'var(--color-gold)' : 'var(--color-muted)' }}>{warnings}</span>
              <span style={s.statLbl}>Category warnings</span>
            </div>
          </div>

          {/* Skip errors list */}
          {preview.errors.length > 0 && (
            <div style={{ ...s.card, borderColor: 'rgba(192,57,43,0.3)' }}>
              <span style={{ ...s.label, color: '#e74c3c' }}>Skipped rows ({preview.errors.length})</span>
              <div style={{ maxHeight: 120, overflowY: 'auto', fontSize: 12, color: '#e74c3c', lineHeight: 1.8 }}>
                {preview.errors.map((e, i) => <div key={i}>{e}</div>)}
              </div>
            </div>
          )}

          {/* Filters + actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <select
              value={filterState}
              onChange={e => setFilterState(e.target.value)}
              style={{ padding: '7px 12px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: 13 }}
            >
              <option value="">All states ({preview.validRows})</option>
              {uniqueStates.map(st => (
                <option key={st} value={st}>{st} ({stateCounts[st]})</option>
              ))}
            </select>

            <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={skipGeocode}
                onChange={e => setSkipGeocode(e.target.checked)}
                style={{ width: 14, height: 14 }}
              />
              Skip geocoding (faster, no map pins)
            </label>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button style={{ ...s.btn, ...s.btnGhost }} onClick={reset} disabled={stage === 'importing'}>
                Cancel
              </button>
              <button
                style={{ ...s.btn, ...s.btnPrimary, opacity: stage === 'importing' ? 0.7 : 1 }}
                onClick={handleCommit}
                disabled={stage === 'importing'}
                onMouseEnter={e => { if (stage !== 'importing') (e.currentTarget as HTMLButtonElement).style.background = '#b8943e' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-gold)' }}
                onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)' }}
                onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
              >
                {stage === 'importing' ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    Importing...
                  </>
                ) : (
                  <>Import {allFilteredRows.length.toLocaleString()} businesses</>
                )}
              </button>
            </div>
          </div>

          {/* Progress bar */}
          {stage === 'importing' && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 6 }}>{progressMsg}</div>
              <div style={s.progress}>
                <div style={{ ...s.progressBar, width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Preview table */}
          <div style={{ ...s.card, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>
                Preview — showing {Math.min(visibleRows.length, 200)} of {allFilteredRows.length} rows
              </span>
              {allFilteredRows.length > 200 && (
                <span style={{ ...s.tag, ...s.tagWarn }}>Full import will include all {allFilteredRows.length}</span>
              )}
            </div>
            <div style={{ overflowX: 'auto', maxHeight: 520, overflowY: 'auto' }}>
              <table style={s.table}>
                <thead style={{ position: 'sticky', top: 0, background: 'var(--color-charcoal)', zIndex: 1 }}>
                  <tr>
                    <th style={s.th}>#</th>
                    <th style={s.th}>Name</th>
                    <th style={s.th}>Category</th>
                    <th style={s.th}>City</th>
                    <th style={s.th}>State</th>
                    <th style={s.th}>Phone</th>
                    <th style={s.th}>Website</th>
                    <th style={s.th}>Coords</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                      <td style={s.tdMuted}>{row._row}</td>
                      <td style={s.td}>
                        <span style={{ fontWeight: 500 }}>{row.name}</span>
                        {row.description && (
                          <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 2, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {row.description}
                          </div>
                        )}
                      </td>
                      <td style={s.td}>
                        <span style={{ ...s.tag, ...s.tagOk }}>{CATEGORY_LABELS[row.category as BusinessCategory] ?? row.category}</span>
                        {row._categoryWarning && (
                          <div style={{ fontSize: 10, color: 'var(--color-gold)', marginTop: 3 }}>{row._categoryWarning}</div>
                        )}
                      </td>
                      <td style={s.td}>{row.city}</td>
                      <td style={s.td}>{row.state}</td>
                      <td style={s.tdMuted}>{row.phone ?? <span style={{ color: 'var(--color-border)' }}>—</span>}</td>
                      <td style={s.tdMuted}>
                        {row.website
                          ? <span style={{ color: 'var(--color-gold)', fontSize: 11 }}>Yes</span>
                          : <span style={{ color: 'var(--color-border)' }}>—</span>}
                      </td>
                      <td style={s.tdMuted}>
                        {row.lat != null
                          ? <span style={{ color: '#3cb371', fontSize: 11 }}>Yes</span>
                          : <span style={{ color: 'var(--color-border)' }}>No</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* DONE */}
      {stage === 'done' && result && (
        <div style={{ ...s.card, textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(46,139,87,0.15)', border: '1px solid rgba(46,139,87,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3cb371" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8, letterSpacing: '-0.01em' }}>
            Import complete
          </p>
          <p style={{ fontSize: 15, color: 'var(--color-muted)', marginBottom: 28 }}>
            <strong style={{ color: '#3cb371' }}>{result.inserted.toLocaleString()}</strong> businesses added to the directory
            {result.failed > 0 && <>, <strong style={{ color: '#e74c3c' }}>{result.failed}</strong> failed</>}
          </p>

          {result.failedRows.length > 0 && (
            <div style={{ textAlign: 'left', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 6, padding: '12px 16px', marginBottom: 24, maxHeight: 160, overflowY: 'auto' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#e74c3c', marginBottom: 8 }}>Failed rows</p>
              {result.failedRows.map((r, i) => (
                <div key={i} style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 4 }}>
                  <strong>{r.name}</strong>: {r.error}
                </div>
              ))}
            </div>
          )}

          {rollbackDone ? (
            <div style={{ background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 6, padding: '12px 20px', marginBottom: 20, fontSize: 13, color: '#e74c3c', fontWeight: 600 }}>
              Import rolled back. All inserted businesses have been removed.
            </div>
          ) : (
            <div style={{ marginBottom: 20 }}>
              <button
                onClick={handleRollback}
                disabled={rolling}
                style={{ ...s.btn, ...s.btnDanger, opacity: rolling ? 0.7 : 1 }}
                onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)' }}
                onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
              >
                {rolling ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    Rolling back...
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.33"/>
                    </svg>
                    Undo this import
                  </>
                )}
              </button>
              <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 6 }}>
                Removes all {result?.inserted} businesses just imported. Only works within this session.
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button style={{ ...s.btn, ...s.btnPrimary }} onClick={reset}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#b8943e' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-gold)' }}
              onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)' }}
              onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
            >
              Import another file
            </button>
            <a href="/search" style={{ ...s.btn, ...s.btnGhost, textDecoration: 'none' }}>
              View in directory
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
