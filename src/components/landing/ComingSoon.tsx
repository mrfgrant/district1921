'use client'
import { useState } from 'react'
import Image from 'next/image'

type Mode = 'community' | 'owner' | 'suggest'

export function ComingSoon() {
  const [email, setEmail]         = useState('')
  const [mode, setMode]           = useState<Mode>('community')
  const [bizName, setBizName]     = useState('')
  const [bizCity, setBizCity]     = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [status, setStatus]       = useState<'idle'|'loading'|'done'|'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/preregister', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email || undefined, type: mode,
          business_name: bizName || undefined,
          business_city: bizCity || undefined,
        }),
      })
      setStatus(res.ok ? 'done' : 'error')
    } catch { setStatus('error') }
  }

  return (
    <div style={{ fontFamily: 'var(--font-body)', background: 'var(--surface)', color: 'var(--ink)', minHeight: '100dvh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&family=Syne:wght@400;500;600;700&family=Syne+Mono&display=swap');

        .cs-label {
          font-family: var(--font-mono);
          font-size: 10px; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--gold);
          margin-bottom: 28px;
          display: flex; align-items: center; gap: 14px;
        }
        .cs-label::after { content: ''; flex: 1; height: 1px; background: var(--rule); max-width: 80px; }

        .cs-input {
          width: 100%; padding: 12px 16px;
          border: 1px solid var(--rule); border-radius: var(--radius);
          font-size: 14px; color: var(--ink); background: var(--surface-card);
          outline: none; transition: border-color 150ms var(--ease-out);
          font-family: var(--font-body); display: block;
        }
        .cs-input:focus { border-color: var(--sage); }
        .cs-input::placeholder { color: var(--ink-muted); }

        .cs-pillar { padding: 28px 24px; border-right: 1px solid var(--rule); transition: background 160ms; }
        .cs-pillar:last-child { border-right: none; }
        .cs-pillar:hover { background: rgba(197,146,58,0.04); }

        .cs-feat { padding: 22px; border-right: 1px solid var(--rule); border-bottom: 1px solid var(--rule); transition: background 160ms; }
        .cs-feat:hover { background: rgba(197,146,58,0.04); }
        .cs-feat:nth-child(3n) { border-right: none; }
        .cs-feat:nth-last-child(-n+3) { border-bottom: none; }

        .cs-tab {
          flex: 1; padding: 10px 8px;
          background: transparent; border: none; border-right: 1px solid var(--rule);
          color: var(--ink-mid); font-family: var(--font-body);
          font-size: 12px; font-weight: 500; cursor: pointer;
          transition: background 140ms, color 140ms; text-align: center;
        }
        .cs-tab:last-child { border-right: none; }
        .cs-tab.active { background: var(--forest); color: #fff; font-weight: 600; }
        .cs-tab:not(.active):hover { background: var(--surface-2); color: var(--ink); }

        .price-feature { font-size: 13px; line-height: 1.6; padding: 8px 0; border-bottom: 1px solid var(--rule); display: flex; gap: 12px; }
        .price-feature:last-child { border-bottom: none; }

        @keyframes csfu { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .cs-animate { opacity: 0; animation: csfu 0.7s var(--ease-out) forwards; }
        /* ── Mobile ─────────────────────────────────────── */
        @media (max-width: 640px) {
          .cs-section-pad { padding: 40px 20px !important; }
          .cs-hero-text { padding: 0 20px 40px !important; }
          .cs-grid-2col { grid-template-columns: 1fr !important; gap: 28px !important; }
          .cs-grid-3col { grid-template-columns: 1fr !important; }
          .cs-grid-4col { grid-template-columns: 1fr 1fr !important; }
          .cs-grid-mission { grid-template-columns: 1fr !important; gap: 28px !important; }
          .cs-feat:nth-child(3n) { border-right: 1px solid var(--rule) !important; }
          .cs-feat:nth-last-child(-n+3) { border-bottom: 1px solid var(--rule) !important; }
          .cs-feat:nth-child(odd) { border-right: none !important; }
          .cs-feat:last-child { border-bottom: none !important; border-right: 1px solid var(--rule) !important; }
          .cs-pillar { border-right: none !important; border-bottom: 1px solid var(--rule) !important; }
          .cs-pillar:last-child { border-bottom: none !important; }
          .cs-cta-bar { flex-direction: column !important; padding: 32px 20px !important; text-align: center !important; }
          .cs-pricing-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .cs-pricing-free { border-radius: var(--radius-lg) !important; }
          .cs-pricing-pro { border-radius: var(--radius-lg) !important; }
          .cs-footer { padding: 20px !important; flex-direction: column !important; text-align: center !important; }
          .cs-tabs { flex-direction: column !important; }
          .cs-tab { border-right: none !important; border-bottom: 1px solid var(--rule) !important; padding: 12px 16px !important; text-align: left !important; }
          .cs-tab:last-child { border-bottom: none !important; }
          .cs-hero-buttons { flex-direction: column !important; }
          .cs-hero-buttons a { text-align: center !important; }
        }

      `}</style>

      {/* Header */}
      <header style={{ background: 'var(--forest-mid)', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--rule-mid)' }}>
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 0 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 700, color: '#fff', letterSpacing: '-0.015em' }}>District</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--gold)', letterSpacing: '0.08em', marginLeft: 7, position: 'relative', top: -1 }}>1921</span>
        </a>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', background: 'rgba(197,146,58,0.1)', border: '1px solid rgba(197,146,58,0.25)', padding: '5px 12px', borderRadius: 'var(--radius)' }}>
          Now Open
        </span>
      </header>

      {/* Hero */}
      <div style={{ position: 'relative', height: 560, overflow: 'hidden' }}>
        <Image src="/hero-district.png" alt="District 1921" fill priority style={{ objectFit: 'cover', objectPosition: 'center 30%' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,25,18,0.2) 0%, rgba(10,25,18,0.15) 40%, rgba(10,25,18,0.75) 75%, rgba(10,25,18,0.95) 100%)' }} />
        <div className="cs-hero-text" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 48px 52px', maxWidth: 960 }} className="cs-animate">
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 16, opacity: 0.9 }}>District 1921 · All 50 States</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 6vw, 62px)', fontWeight: 700, color: '#fff', lineHeight: 1.06, letterSpacing: '-0.02em', marginBottom: 16 }}>
            The community<br />business directory<br />
            <em style={{ fontStyle: 'italic', color: 'var(--gold-warm)' }}>built for us.</em>
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', maxWidth: 520, lineHeight: 1.65, marginBottom: 28 }}>
            A nationwide directory where community members discover, share, and support businesses — and owners build a real presence. <strong style={{ color: 'var(--gold-warm)' }}>Free to search. Free to list.</strong>
          </p>
          <div className="cs-hero-buttons" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="/search" style={{ display: 'inline-block', background: 'var(--gold)', color: 'var(--forest)', padding: '13px 26px', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, textDecoration: 'none', borderRadius: 'var(--radius-md)', letterSpacing: '0.02em' }}>
              Search the Directory →
            </a>
            <a href="/login?next=/onboarding" style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.9)', padding: '13px 26px', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, textDecoration: 'none', borderRadius: 'var(--radius-md)' }}>
              List Your Business
            </a>
          </div>
        </div>
      </div>

      {/* Mission */}
      <div className="cs-section-pad" style={{ padding: '64px 48px', borderBottom: '1px solid var(--rule)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <p className="cs-label">Our Mission</p>
          <div className="cs-grid-mission" style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 56, alignItems: 'start' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 700, lineHeight: 1.5, color: 'var(--ink)', marginBottom: 20 }}>
                On May 31, 1921, <em style={{ fontStyle: 'italic', color: 'var(--sage)' }}>Black Wall Street</em> was burned to the ground. We carry that name forward — not as a monument, but as a foundation.
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--ink-mid)', marginBottom: 16 }}>
                The <strong style={{ color: 'var(--ink)' }}>Greenwood District of Tulsa, Oklahoma</strong> was one of the wealthiest Black communities in American history. Over 35 blocks of thriving businesses, homes, hospitals, and schools were destroyed in 18 hours. Built from nothing. Gone overnight.
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--ink-mid)' }}>
                District 1921 is the directory that should have always existed — a place where every community business is findable, shareable, and supported. <strong style={{ color: 'var(--ink)' }}>The community will know what this name means. Everyone else will get curious.</strong>
              </p>
            </div>
            <div style={{ background: 'var(--forest)', padding: 28, borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 700, color: 'var(--gold)', lineHeight: 1, marginBottom: 4 }}>1921</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Greenwood District, Tulsa</div>
              {['35+ blocks destroyed in 18 hours','10,000 residents left homeless','600+ businesses burned to the ground','Called "Black Wall Street" for its prosperity','One of the worst acts of racial violence in US history'].map(f => (
                <div key={f} style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 10, lineHeight: 1.6 }}>
                  <span style={{ color: 'var(--gold)', flexShrink: 0 }}>—</span>{f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pillars */}
      <div className="cs-section-pad" style={{ padding: '64px 48px', borderBottom: '1px solid var(--rule)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <p className="cs-label">What We're Building</p>
          <div className="cs-grid-4col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', border: '1px solid var(--rule)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {[
              { n:'01', t:'Discovery', d:'Search and find community businesses across every city in all 50 states. Map-first, mobile-first, community-driven.' },
              { n:'02', t:'Trust', d:'The Gold Shield — earned through real verification. SOS lookup, phone check, web reachability, and a proof photo.' },
              { n:'03', t:'Community', d:'Check-ins, follows, deals, events, jobs, and a request board connecting community needs to verified businesses.' },
              { n:'04', t:'Ownership', d:'$15/month flat. Full profile, analytics, leads. No upsells, no ad dependency. Professional presence. Yours to own.' },
            ].map(p => (
              <div key={p.n} className="cs-pillar">
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.15em', color: 'var(--gold)', marginBottom: 14 }}>{p.n}</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>{p.t}</p>
                <p style={{ fontSize: 13, lineHeight: 1.75, color: 'var(--ink-mid)' }}>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="cs-section-pad" style={{ padding: '64px 48px', borderBottom: '1px solid var(--rule)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <p className="cs-label">Platform Features</p>
          <div className="cs-grid-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', border: '1px solid var(--rule)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {[
              { tag:'Deals', t:'Community Deals', d:'Owners post exclusive offers. Followers get notified first. Browse deals across every category and city.' },
              { tag:'Events', t:'Local Events', d:'Grand openings, pop-ups, gatherings. Discover what\'s happening near you, searchable by city.' },
              { tag:'Jobs', t:'Job Board', d:'Community businesses hiring community members. 30-day listings, direct applications, no middleman.' },
              { tag:'Requests', t:'Request Board', d:'"I need a plumber in Atlanta." Post a need, get matched to verified local businesses.' },
              { tag:'Verification', t:'Gold Shield', d:'SOS lookup, phone check, web reachability, and a proof photo. Earned — not purchased.' },
              { tag:'Map', t:'Near Me', d:'Clustered pins, open-now filters, mobile service flags. Find community businesses wherever you are.' },
            ].map(f => (
              <div key={f.t} className="cs-feat">
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--sage)', marginBottom: 10, display: 'block' }}>{f.tag}</span>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>{f.t}</p>
                <p style={{ fontSize: 13, lineHeight: 1.75, color: 'var(--ink-mid)' }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA bar */}
      <div className="cs-cta-bar" style={{ background: 'var(--forest)', padding: '40px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 6, letterSpacing: '-0.01em' }}>Ready to find your community?</h3>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', maxWidth: 460, lineHeight: 1.6 }}>The directory is live and growing. Search businesses near you or add one today.</p>
        </div>
        <a href="/search" style={{ background: 'var(--gold)', color: 'var(--forest)', padding: '13px 26px', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>
          Search the Directory →
        </a>
      </div>

      {/* Registration */}
      <div className="cs-section-pad" id="register" style={{ padding: '64px 48px', background: 'var(--surface-card)' }}>
        <div className="cs-grid-2col" style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }}>
          <div>
            <p className="cs-label">Get Involved</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, lineHeight: 1.1, color: 'var(--ink)', marginBottom: 14, letterSpacing: '-0.02em' }}>
              Be first<br /><em style={{ fontStyle: 'italic', color: 'var(--sage)' }}>through the doors.</em>
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--ink-mid)', marginBottom: 16 }}>Join the community, register your business, or nominate one you love.</p>
            <p style={{ fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.7 }}>Every business submitted gets researched and added to our seed data. Early registered owners get 3 months free.</p>
          </div>
          <div>
            {status === 'done' ? (
              <div style={{ border: '1px solid var(--open-bg)', background: 'var(--open-bg)', padding: 32, textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--open-text)', marginBottom: 10 }}>{mode === 'suggest' ? 'Submitted.' : "You're in."}</p>
                <p style={{ fontSize: 13, color: 'var(--open-text)', lineHeight: 1.7 }}>
                  {mode === 'suggest' ? "We'll research it and add it to the directory." : "We'll be in touch. Tell someone."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="cs-tabs" style={{ display: 'flex', border: '1px solid var(--rule)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 16 }}>
                  {(['community','owner','suggest'] as Mode[]).map(m => (
                    <button key={m} type="button" className={`cs-tab ${mode === m ? 'active' : ''}`} onClick={() => setMode(m)}>
                      {m === 'community' ? 'Community' : m === 'owner' ? 'Business Owner' : 'Suggest a Business'}
                    </button>
                  ))}
                </div>
                {mode === 'suggest' ? (
                  <>
                    <div style={{ background: 'rgba(197,146,58,0.06)', border: '1px solid var(--shield-border)', padding: '12px 16px', fontSize: 13, lineHeight: 1.65, color: 'var(--ink-soft)', marginBottom: 12, borderRadius: 'var(--radius)' }}>
                      Know a business that should be listed? <strong>We'll research it and reach out to the owner.</strong>
                    </div>
                    <input className="cs-input" style={{ marginBottom: 8 }} type="text" placeholder="Business name" value={bizName} onChange={e => setBizName(e.target.value)} required />
                    <input className="cs-input" style={{ marginBottom: 8 }} type="text" placeholder="City, State  (e.g. Atlanta, GA)" value={bizCity} onChange={e => setBizCity(e.target.value)} required />
                    <input className="cs-input" style={{ marginBottom: 8 }} type="email" placeholder="Business owner's email (optional)" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} />
                    <input className="cs-input" style={{ marginBottom: 8 }} type="email" placeholder="Your email (optional)" value={email} onChange={e => setEmail(e.target.value)} />
                  </>
                ) : (
                  <input className="cs-input" style={{ marginBottom: 8 }} type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                )}
                <button type="submit" disabled={status === 'loading' || (mode === 'suggest' ? !bizName || !bizCity : !email)} style={{
                  width: '100%', marginTop: 4, padding: '13px', borderRadius: 'var(--radius)',
                  background: 'var(--forest)', border: 'none', color: '#fff',
                  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                  letterSpacing: '0.03em', cursor: 'pointer', opacity: status === 'loading' ? 0.6 : 1,
                }}>
                  {status === 'loading' ? 'Submitting...' : mode === 'suggest' ? 'Submit Business' : 'Join Waitlist'}
                </button>
                {status === 'error' && <p style={{ marginTop: 10, fontSize: 12, color: 'var(--closed-text)' }}>Something went wrong. Try again.</p>}
                <p style={{ marginTop: 12, fontSize: 11, color: 'var(--ink-muted)', lineHeight: 1.65 }}>
                  {mode === 'community' && 'First access updates. One email — no spam.'}
                  {mode === 'owner' && '3 months free at launch. One email — no spam.'}
                  {mode === 'suggest' && 'We research every submission. No spam, ever.'}
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="cs-section-pad" id="pricing" style={{ padding: '64px 48px', borderTop: '1px solid var(--rule)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <p className="cs-label">How It Works</p>
          <div className="cs-pricing-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <div style={{ padding: 36, border: '1px solid var(--rule)', borderRadius: 'var(--radius-lg) 0 0 var(--radius-lg)', background: 'var(--surface-card)' }} className="cs-pricing-free">
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--sage)', marginBottom: 10 }}>Free Listing</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 700, color: 'var(--ink)', lineHeight: 1, marginBottom: 4 }}>$0</p>
              <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--rule)' }}>Forever free — no credit card</p>
              {['Appears in search results','Business name, category, city','Community ratings (3–5 stars)','Check-ins and follows'].map(f => (
                <div key={f} className="price-feature"><span style={{ color: 'var(--sage)', fontWeight: 700 }}>✓</span><span style={{ color: 'var(--ink-mid)' }}>{f}</span></div>
              ))}
              <p style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--rule)', fontSize: 12, color: 'var(--ink-muted)', lineHeight: 1.6 }}>The directory grows through the community. Anyone can add a listing — owners and members alike.</p>
            </div>
            <div style={{ padding: 36, border: '1px solid var(--forest)', borderRadius: '0 var(--radius-lg) var(--radius-lg) 0', background: 'var(--forest)', color: '#fff' }} className="cs-pricing-pro">
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10 }}>Professional Page</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 700, color: '#fff', lineHeight: 1, marginBottom: 4 }}>$15<span style={{ fontSize: 18, fontWeight: 400 }}>/mo</span></p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>$90 billed every 6 months · auto-renews</p>
              {['Everything in Free, plus:','Full profile with logo & photos','Hours, contact info, website','Post deals, events, and jobs','Receive community leads directly','Analytics — views, clicks, check-ins','Gold Shield verification ($25 one-time)','Priority placement in search'].map(f => (
                <div key={f} style={{ fontSize: 13, lineHeight: 1.6, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 12, color: f === 'Everything in Free, plus:' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.82)' }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                </div>
              ))}
              <p style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>Early registered owners get 3 months free at launch.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="cs-footer" style={{ background: 'var(--forest)', padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#fff' }}>
          District <span style={{ color: 'var(--gold)' }}>1921</span>
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em' }}>
          &copy; 2026 · All 50 States · Built for the community
        </span>
      </footer>
    </div>
  )
}
