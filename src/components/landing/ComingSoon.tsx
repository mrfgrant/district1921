'use client'
import { useState } from 'react'

type Mode = 'community' | 'owner' | 'suggest'

export function ComingSoon() {
  const [email, setEmail] = useState('')
  const [mode, setMode] = useState<Mode>('community')
  const [bizName, setBizName] = useState('')
  const [bizCity, setBizCity] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/preregister', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email || undefined,
          type: mode,
          business_name: bizName || undefined,
          business_city: bizCity || undefined,
        }),
      })
      setStatus(res.ok ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="cs">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=DM+Mono:wght@300;400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .cs{min-height:100vh;background:#080806;color:#EDE8DF;font-family:'DM Mono',monospace;overflow-x:hidden;position:relative}
        .cs::before{content:'';position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");pointer-events:none;z-index:1;opacity:0.4}
        .bg-accent{position:fixed;top:-200px;right:-200px;width:600px;height:600px;background:radial-gradient(circle,rgba(201,168,76,0.05) 0%,transparent 70%);pointer-events:none;z-index:0}
        .wrap{position:relative;z-index:2;max-width:800px;margin:0 auto;padding:80px 32px 120px}

        .eyebrow{font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#C9A84C;margin-bottom:48px;opacity:0;animation:fu 0.8s ease forwards}
        .headline{font-family:'Cormorant Garamond',Georgia,serif;font-size:clamp(56px,10vw,96px);font-weight:300;line-height:0.95;letter-spacing:-0.02em;color:#EDE8DF;margin-bottom:8px;opacity:0;animation:fu 0.8s ease 0.1s forwards}
        .headline em{font-style:italic;color:#C9A84C}
        .year{font-family:'Cormorant Garamond',Georgia,serif;font-size:clamp(56px,10vw,96px);font-weight:700;line-height:0.95;letter-spacing:-0.02em;color:#C9A84C;margin-bottom:56px;opacity:0;animation:fu 0.8s ease 0.2s forwards}
        .rule{width:64px;height:1px;background:#C9A84C;margin-bottom:48px;opacity:0;animation:fu 0.8s ease 0.3s forwards}

        .lbl{font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#C9A84C;margin-bottom:20px}

        /* history */
        .history{margin-bottom:64px;opacity:0;animation:fu 0.8s ease 0.4s forwards}
        .history p{font-family:'Cormorant Garamond',Georgia,serif;font-size:clamp(19px,2.5vw,23px);font-weight:300;line-height:1.75;color:#C8C4BC;margin-bottom:22px}
        .history p strong{color:#EDE8DF;font-weight:600}
        .history p em{color:#C9A84C;font-style:italic}

        /* pillars */
        .building{margin-bottom:64px;opacity:0;animation:fu 0.8s ease 0.5s forwards}
        .pillars{display:grid;grid-template-columns:1fr 1fr;gap:2px}
        @media(max-width:560px){.pillars{grid-template-columns:1fr}}
        .pillar{background:#111108;border:1px solid #222218;padding:28px;transition:border-color 0.2s}
        .pillar:hover{border-color:#C9A84C}
        .pillar-num{font-size:11px;letter-spacing:0.2em;color:#C9A84C;margin-bottom:14px}
        .pillar-title{font-family:'Cormorant Garamond',Georgia,serif;font-size:26px;font-weight:600;color:#EDE8DF;margin-bottom:12px}
        .pillar-body{font-size:13px;line-height:1.8;color:#9A9888;letter-spacing:0.01em}

        /* seeding */
        .seeding{background:#0F0F0C;border:1px solid #1E1E18;border-left:3px solid #C9A84C;padding:32px 36px;margin-bottom:64px;opacity:0;animation:fu 0.8s ease 0.55s forwards}
        .seeding p{font-family:'Cormorant Garamond',Georgia,serif;font-size:19px;font-weight:300;line-height:1.75;color:#C8C4BC;margin-bottom:14px}
        .seeding p:last-child{margin-bottom:0}
        .seeding ul{list-style:none;margin-top:16px}
        .seeding ul li{font-size:13px;color:#8A8878;padding:8px 0;border-bottom:1px solid #1A1A16;display:flex;gap:14px;letter-spacing:0.01em;line-height:1.6}
        .seeding ul li::before{content:'→';color:#C9A84C;flex-shrink:0;margin-top:1px}
        .seeding ul li:last-child{border-bottom:none}

        /* features */
        .features{margin-bottom:64px;opacity:0;animation:fu 0.8s ease 0.62s forwards}
        .feat-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:2px}
        @media(max-width:640px){.feat-grid{grid-template-columns:1fr 1fr}}
        @media(max-width:420px){.feat-grid{grid-template-columns:1fr}}
        .feat-card{background:#111108;border:1px solid #222218;padding:22px 24px;transition:border-color 0.2s}
        .feat-card:hover{border-color:#C9A84C}
        .feat-tag{display:inline-block;font-size:9px;letter-spacing:0.25em;text-transform:uppercase;color:#C9A84C;background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.18);padding:3px 9px;margin-bottom:14px}
        .feat-title{font-family:'Cormorant Garamond',Georgia,serif;font-size:20px;font-weight:600;color:#D8D4CC;margin-bottom:8px}
        .feat-desc{font-size:12px;line-height:1.75;color:#6A6858;letter-spacing:0.01em}

        /* form */
        .form-wrap{background:#161612;border:1px solid #2C2C22;border-top:3px solid #C9A84C;padding:44px;opacity:0;animation:fu 0.8s ease 0.72s forwards}
        @media(max-width:560px){.form-wrap{padding:28px 20px}}
        .form-headline{font-family:'Cormorant Garamond',Georgia,serif;font-size:30px;font-weight:300;color:#EDE8DF;margin-bottom:8px;line-height:1.2}
        .form-sub{font-size:12px;color:#6A6858;letter-spacing:0.03em;margin-bottom:28px;line-height:1.6}

        /* mode tabs */
        .tabs{display:flex;margin-bottom:24px;gap:2px}
        .tab{flex:1;padding:14px 8px;background:#0C0C0A;border:1px solid #2C2C22;color:#5A5848;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer;transition:all 0.2s;text-align:center}
        .tab.active{background:#C9A84C;color:#080806;border-color:#C9A84C;font-weight:500}
        .tab:not(.active):hover{color:#EDE8DF;background:#1E1E14;border-color:#3A3A28}

        .field-group{display:flex;flex-direction:column;gap:2px;margin-bottom:2px}
        .frow{display:flex;gap:2px;margin-bottom:2px}
        .einput{flex:1;padding:16px 20px;background:#0C0C0A;border:1px solid #2C2C22;color:#EDE8DF;font-family:'DM Mono',monospace;font-size:13px;outline:none;transition:border-color 0.2s;letter-spacing:0.01em;width:100%}
        .einput::placeholder{color:#3A3A28}
        .einput:focus{border-color:#C9A84C}
        .sbtn{padding:16px 36px;background:#C9A84C;border:none;color:#080806;font-family:'DM Mono',monospace;font-size:11px;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;cursor:pointer;transition:background 0.2s;white-space:nowrap;margin-top:2px;width:100%}
        .sbtn:hover{background:#E8C87A}
        .sbtn:disabled{opacity:0.5;cursor:not-allowed}
        .fnote{margin-top:16px;font-size:11px;color:#484830;letter-spacing:0.03em;line-height:1.65}

        /* suggest hint */
        .suggest-hint{background:#0C0C0A;border:1px solid #2A2A18;padding:16px 20px;margin-bottom:2px}
        .suggest-hint p{font-size:12px;color:#7A7860;line-height:1.65;letter-spacing:0.01em}
        .suggest-hint strong{color:#C9A84C;font-weight:500}

        /* success */
        .success{background:#0F0F0C;border:1px solid #C9A84C;padding:36px;text-align:center}
        .success-title{font-family:'Cormorant Garamond',Georgia,serif;font-size:32px;font-weight:300;color:#C9A84C;margin-bottom:14px}
        .success-body{font-size:13px;color:#7A7870;line-height:1.8;letter-spacing:0.01em}

        /* footer */
        .footer{margin-top:80px;padding-top:32px;border-top:1px solid #1A1A16;display:flex;justify-content:space-between;align-items:center;opacity:0;animation:fu 0.8s ease 0.9s forwards;flex-wrap:wrap;gap:16px}
        .footer-brand{font-family:'Cormorant Garamond',Georgia,serif;font-size:16px;font-weight:600;color:#C9A84C;letter-spacing:0.05em}
        .footer-copy{font-size:10px;color:#3A3A2C;letter-spacing:0.1em}

        @keyframes fu{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <div className="bg-accent" />

      <div className="wrap">
        <p className="eyebrow">District 1921 &nbsp;·&nbsp; Est. 2025 &nbsp;·&nbsp; All 50 States</p>
        <h1 className="headline">Built for <em>us,</em></h1>
        <p className="year">by us.</p>
        <div className="rule" />

        {/* History */}
        <div className="history">
          <p className="lbl">The Name</p>
          <p>On May 31, 1921, the <strong>Greenwood District of Tulsa, Oklahoma</strong> — known the world over as <em>Black Wall Street</em> — was destroyed in one of the most devastating acts of racial violence in American history. Over 35 blocks of thriving Black-owned businesses, homes, hospitals, and schools were burned to the ground.</p>
          <p>It was one of the wealthiest Black communities America had ever produced. Built from nothing. Burned in 18 hours. <strong>District 1921 carries that name forward.</strong></p>
          <p>Not as a monument to what was lost — but as a foundation for what we're building now. The community will know. Everyone else will get curious.</p>
        </div>

        {/* Pillars */}
        <div className="building">
          <p className="lbl">What We're Building</p>
          <div className="pillars">
            <div className="pillar">
              <p className="pillar-num">01</p>
              <p className="pillar-title">Discovery</p>
              <p className="pillar-body">Search and find community businesses across every city in all 50 states. Map-first, mobile-first, community-driven.</p>
            </div>
            <div className="pillar">
              <p className="pillar-num">02</p>
              <p className="pillar-title">Trust</p>
              <p className="pillar-body">The Gold Shield — earned through real verification, not a checkbox. SOS lookup, phone, web, and a proof photo.</p>
            </div>
            <div className="pillar">
              <p className="pillar-num">03</p>
              <p className="pillar-title">Community</p>
              <p className="pillar-body">Check-ins, follows, deals, events, jobs, and a request board where the community posts needs and businesses respond.</p>
            </div>
            <div className="pillar">
              <p className="pillar-num">04</p>
              <p className="pillar-title">Ownership</p>
              <p className="pillar-body">$15/month — flat. No upsells, no ad dependency. Analytics, leads, and a full business profile. Yours to own.</p>
            </div>
          </div>
        </div>

        {/* Seeding */}
        <div className="seeding">
          <p className="lbl">Where We Are Now</p>
          <p>We are actively pre-seeding the directory — researching and adding community businesses across the country before launch so the platform has real depth from day one.</p>
          <p>Here's what to expect:</p>
          <ul>
            <li>Pre-registered community members get first access when we open the doors</li>
            <li>Business owners will be notified if we've already added their listing and can claim it</li>
            <li>The full platform — search, map, profiles, Gold Shield — goes live Q3 2025</li>
            <li>Early registered owners get 3 months free when we launch paid subscriptions</li>
          </ul>
        </div>

        {/* Coming soon features */}
        <div className="features">
          <p className="lbl">Coming to the platform</p>
          <div className="feat-grid">
            <div className="feat-card">
              <span className="feat-tag">Deals</span>
              <p className="feat-title">Community Deals</p>
              <p className="feat-desc">Business owners post exclusive offers. Followers get notified first. Browse deals across every category and city.</p>
            </div>
            <div className="feat-card">
              <span className="feat-tag">Events</span>
              <p className="feat-title">Local Events</p>
              <p className="feat-desc">Grand openings, pop-ups, community gatherings. Discover what's happening near you, listed by city.</p>
            </div>
            <div className="feat-card">
              <span className="feat-tag">Jobs</span>
              <p className="feat-title">Job Board</p>
              <p className="feat-desc">Community businesses hiring community members. 30-day listings, direct applications, no middleman.</p>
            </div>
            <div className="feat-card">
              <span className="feat-tag">Requests</span>
              <p className="feat-title">Request Board</p>
              <p className="feat-desc">"I need a plumber in Atlanta." Post a need, get matched to verified local businesses in your city.</p>
            </div>
            <div className="feat-card">
              <span className="feat-tag">Gold Shield</span>
              <p className="feat-title">Verified Trust</p>
              <p className="feat-desc">SOS lookup, phone check, web reachability, and a proof photo. The Gold Shield is earned — not purchased.</p>
            </div>
            <div className="feat-card">
              <span className="feat-tag">Near Me</span>
              <p className="feat-title">Find Near You</p>
              <p className="feat-desc">Clustered map pins, open-now filters, mobile service flags. Find community businesses wherever you are.</p>
            </div>
          </div>
        </div>

        {/* Registration */}
        <div className="form-wrap">
          <p className="lbl">Get involved</p>
          <p className="form-headline">Be first through the doors.</p>
          <p className="form-sub">Join the waitlist, register your business, or nominate one you love — we'll make sure it's in the directory on launch day.</p>

          {status === 'done' ? (
            <div className="success">
              <p className="success-title">{mode === 'suggest' ? 'Business submitted.' : "You're in."}</p>
              <p className="success-body">
                {mode === 'suggest'
                  ? "We'll add it to our seed list and reach out to the owner before launch.\nIn the meantime — tell someone about District 1921."
                  : "We'll reach out as soon as District 1921 opens its doors.\nIn the meantime — tell someone."}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="tabs">
                <button type="button" className={`tab ${mode === 'community' ? 'active' : ''}`} onClick={() => setMode('community')}>
                  I'm a community member
                </button>
                <button type="button" className={`tab ${mode === 'owner' ? 'active' : ''}`} onClick={() => setMode('owner')}>
                  I own a business
                </button>
                <button type="button" className={`tab ${mode === 'suggest' ? 'active' : ''}`} onClick={() => setMode('suggest')}>
                  Suggest a business
                </button>
              </div>

              {mode === 'suggest' ? (
                <>
                  <div className="suggest-hint">
                    <p>Know a community business that should be in the directory? Submit it below. <strong>We'll research it, add it to our seed data, and notify the owner before launch.</strong> No email required — just the business details.</p>
                  </div>
                  <div className="field-group">
                    <input className="einput" type="text" placeholder="Business name" value={bizName} onChange={e => setBizName(e.target.value)} required />
                    <input className="einput" type="text" placeholder="City, State (e.g. Atlanta, GA)" value={bizCity} onChange={e => setBizCity(e.target.value)} required />
                    <input className="einput" type="email" placeholder="Your email (optional — we'll update you when it's live)" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </>
              ) : (
                <div className="frow">
                  <input className="einput" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              )}

              <button type="submit" className="sbtn" disabled={status === 'loading' || (mode === 'suggest' ? !bizName || !bizCity : !email)}>
                {status === 'loading' ? 'Submitting...' : mode === 'suggest' ? 'Submit Business' : 'Join Waitlist'}
              </button>

              {status === 'error' && <p style={{marginTop:'12px',fontSize:'12px',color:'#E85454'}}>Something went wrong. Try again.</p>}

              <p className="fnote">
                {mode === 'community' && 'First access at launch. One email — no spam.'}
                {mode === 'owner' && 'Business owners get 3 months free at launch. One email — no spam.'}
                {mode === 'suggest' && 'We research every submission. The owner will be contacted before we go live.'}
              </p>
            </form>
          )}
        </div>

        <div className="footer">
          <span className="footer-brand">District 1921</span>
          <span className="footer-copy">© 2025 &nbsp;·&nbsp; All 50 States &nbsp;·&nbsp; Built for the community</span>
        </div>
      </div>
    </div>
  )
}
