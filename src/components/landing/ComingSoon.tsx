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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,600&family=Instrument+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .cs {
          min-height: 100vh;
          background: #F5F0E8;
          color: #1A1612;
          font-family: 'Instrument Sans', system-ui, sans-serif;
          overflow-x: hidden;
        }

        /* ── Top bar ── */
        .topbar {
          border-bottom: 1px solid #D8D0C0;
          padding: 0 40px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #F5F0E8;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .topbar-brand {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 18px;
          font-weight: 600;
          color: #1A1612;
          letter-spacing: 0.02em;
        }
        .topbar-status {
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #8A7A5A;
        }

        /* ── Hero ── */
        .hero {
          border-bottom: 1px solid #D8D0C0;
          padding: 80px 40px 72px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          opacity: 0;
          animation: fadeIn 0.9s ease forwards;
        }
        @media(max-width: 700px) { .hero { grid-template-columns: 1fr; padding: 56px 24px 48px; } }

        .hero-left { padding-right: 48px; border-right: 1px solid #D8D0C0; }
        @media(max-width: 700px) { .hero-left { padding-right: 0; border-right: none; border-bottom: 1px solid #D8D0C0; padding-bottom: 40px; margin-bottom: 40px; } }

        .hero-eyebrow {
          font-size: 10px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #8A7A5A;
          margin-bottom: 24px;
        }
        .hero-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(52px, 8vw, 88px);
          font-weight: 300;
          line-height: 0.92;
          letter-spacing: -0.02em;
          color: #1A1612;
          margin-bottom: 32px;
        }
        .hero-title em {
          font-style: italic;
          color: #7A5C2A;
        }
        .hero-desc {
          font-size: 15px;
          line-height: 1.75;
          color: #5A5040;
          max-width: 380px;
        }

        .hero-right { padding-left: 48px; display: flex; flex-direction: column; justify-content: space-between; }
        @media(max-width: 700px) { .hero-right { padding-left: 0; } }

        .hero-stat {
          margin-bottom: 32px;
        }
        .hero-stat-num {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 52px;
          font-weight: 300;
          color: #1A1612;
          line-height: 1;
          margin-bottom: 6px;
        }
        .hero-stat-label {
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #8A7A5A;
        }
        .hero-quote {
          border-left: 2px solid #C4A96A;
          padding-left: 20px;
        }
        .hero-quote p {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 18px;
          font-weight: 300;
          font-style: italic;
          line-height: 1.6;
          color: #4A3C28;
        }
        .hero-quote cite {
          display: block;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #8A7A5A;
          margin-top: 10px;
          font-style: normal;
        }

        /* ── Sections ── */
        .section {
          border-bottom: 1px solid #D8D0C0;
          padding: 64px 40px;
          opacity: 0;
          animation: fadeIn 0.9s ease forwards;
        }
        @media(max-width: 700px) { .section { padding: 48px 24px; } }

        .section-inner { max-width: 960px; margin: 0 auto; }

        .sec-label {
          font-size: 10px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #8A7A5A;
          margin-bottom: 36px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .sec-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #D8D0C0;
          max-width: 120px;
        }

        /* ── History ── */
        .history-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 48px;
          align-items: start;
        }
        @media(max-width: 700px) { .history-grid { grid-template-columns: 1fr; gap: 32px; } }

        .history-body p {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(19px, 2.2vw, 22px);
          font-weight: 300;
          line-height: 1.75;
          color: #2A2018;
          margin-bottom: 22px;
        }
        .history-body p:last-child { margin-bottom: 0; }
        .history-body strong { font-weight: 600; color: #1A1612; }
        .history-body em { font-style: italic; color: #7A5C2A; }

        .history-aside {
          background: #EDE6D6;
          border: 1px solid #D8D0C0;
          padding: 28px;
        }
        .aside-date {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 42px;
          font-weight: 300;
          color: #7A5C2A;
          line-height: 1;
          margin-bottom: 4px;
        }
        .aside-sublabel {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #8A7A5A;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #D8D0C0;
        }
        .aside-facts li {
          list-style: none;
          font-size: 12px;
          line-height: 1.65;
          color: #5A5040;
          padding: 6px 0;
          border-bottom: 1px solid #D8D0C0;
          display: flex;
          gap: 10px;
        }
        .aside-facts li:last-child { border-bottom: none; }
        .aside-facts li::before { content: '—'; color: #C4A96A; flex-shrink: 0; }

        /* ── Pillars ── */
        .pillars {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          border: 1px solid #D8D0C0;
        }
        @media(max-width: 700px) { .pillars { grid-template-columns: 1fr 1fr; } }
        @media(max-width: 440px) { .pillars { grid-template-columns: 1fr; } }

        .pillar {
          padding: 32px 28px;
          border-right: 1px solid #D8D0C0;
          transition: background 0.2s;
        }
        .pillar:last-child { border-right: none; }
        @media(max-width: 700px) {
          .pillar:nth-child(2) { border-right: none; }
          .pillar:nth-child(1), .pillar:nth-child(2) { border-bottom: 1px solid #D8D0C0; }
        }
        .pillar:hover { background: #EDE6D6; }
        .pillar-num {
          font-size: 10px;
          letter-spacing: 0.2em;
          color: #C4A96A;
          margin-bottom: 16px;
        }
        .pillar-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 24px;
          font-weight: 500;
          color: #1A1612;
          margin-bottom: 12px;
          line-height: 1.1;
        }
        .pillar-body {
          font-size: 13px;
          line-height: 1.75;
          color: #6A5E4A;
        }

        /* ── Seeding ── */
        .seeding-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
        }
        @media(max-width: 700px) { .seeding-grid { grid-template-columns: 1fr; gap: 32px; } }

        .seeding-intro {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(18px, 2vw, 21px);
          font-weight: 300;
          line-height: 1.75;
          color: #2A2018;
        }
        .seeding-intro strong { font-weight: 600; color: #1A1612; }

        .timeline { list-style: none; }
        .timeline li {
          display: flex;
          gap: 20px;
          padding: 16px 0;
          border-bottom: 1px solid #D8D0C0;
          align-items: flex-start;
        }
        .timeline li:last-child { border-bottom: none; }
        .tl-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #C4A96A;
          margin-top: 6px;
          flex-shrink: 0;
        }
        .tl-text {
          font-size: 13px;
          line-height: 1.65;
          color: #5A5040;
        }
        .tl-text strong { color: #1A1612; font-weight: 500; }

        /* ── Features ── */
        .feat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
          border: 1px solid #D8D0C0;
        }
        @media(max-width: 700px) { .feat-grid { grid-template-columns: 1fr 1fr; } }
        @media(max-width: 440px) { .feat-grid { grid-template-columns: 1fr; } }

        .feat-card {
          padding: 28px;
          border-right: 1px solid #D8D0C0;
          border-bottom: 1px solid #D8D0C0;
          transition: background 0.2s;
        }
        .feat-card:nth-child(3n) { border-right: none; }
        .feat-card:nth-last-child(-n+3) { border-bottom: none; }
        @media(max-width: 700px) {
          .feat-card:nth-child(3n) { border-right: 1px solid #D8D0C0; }
          .feat-card:nth-child(2n) { border-right: none; }
          .feat-card:nth-last-child(-n+3) { border-bottom: 1px solid #D8D0C0; }
          .feat-card:nth-last-child(-n+2) { border-bottom: none; }
        }
        .feat-card:hover { background: #EDE6D6; }
        .feat-tag {
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #8A7A5A;
          margin-bottom: 14px;
          display: block;
        }
        .feat-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 20px;
          font-weight: 500;
          color: #1A1612;
          margin-bottom: 10px;
        }
        .feat-desc {
          font-size: 13px;
          line-height: 1.75;
          color: #6A5E4A;
        }

        /* ── Registration ── */
        .reg-section {
          padding: 64px 40px 80px;
          opacity: 0;
          animation: fadeIn 0.9s ease 0.4s forwards;
        }
        @media(max-width: 700px) { .reg-section { padding: 48px 24px 64px; } }

        .reg-inner {
          max-width: 960px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: start;
        }
        @media(max-width: 700px) { .reg-inner { grid-template-columns: 1fr; gap: 40px; } }

        .reg-copy h2 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(36px, 5vw, 52px);
          font-weight: 300;
          line-height: 1.05;
          color: #1A1612;
          margin-bottom: 20px;
        }
        .reg-copy h2 em { font-style: italic; color: #7A5C2A; }
        .reg-copy p {
          font-size: 14px;
          line-height: 1.75;
          color: #5A5040;
          margin-bottom: 32px;
        }
        .reg-copy-stat {
          border-top: 1px solid #D8D0C0;
          padding-top: 24px;
        }
        .reg-copy-stat p {
          font-size: 12px;
          line-height: 1.6;
          color: #8A7A5A;
          margin-bottom: 0;
        }
        .reg-copy-stat strong { color: #1A1612; font-weight: 500; }

        /* Tabs */
        .tabs {
          display: flex;
          border: 1px solid #C8BEA8;
          margin-bottom: 24px;
          overflow: hidden;
        }
        .tab {
          flex: 1;
          padding: 12px 8px;
          background: transparent;
          border: none;
          border-right: 1px solid #C8BEA8;
          color: #8A7A5A;
          font-family: 'Instrument Sans', system-ui, sans-serif;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.18s;
        }
        .tab:last-child { border-right: none; }
        .tab.active {
          background: #1A1612;
          color: #F5F0E8;
        }
        .tab:not(.active):hover { background: #EDE6D6; color: #1A1612; }

        /* Inputs */
        .field { margin-bottom: 2px; }
        .einput {
          width: 100%;
          padding: 14px 18px;
          background: #FFFFFF;
          border: 1px solid #C8BEA8;
          color: #1A1612;
          font-family: 'Instrument Sans', system-ui, sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.18s;
          display: block;
        }
        .einput::placeholder { color: #B0A48A; }
        .einput:focus { border-color: #7A5C2A; }

        .sbtn {
          width: 100%;
          margin-top: 2px;
          padding: 16px;
          background: #1A1612;
          border: none;
          color: #F5F0E8;
          font-family: 'Instrument Sans', system-ui, sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.18s;
        }
        .sbtn:hover { background: #2E2620; }
        .sbtn:disabled { opacity: 0.4; cursor: not-allowed; }

        .fnote {
          margin-top: 14px;
          font-size: 11px;
          color: #8A7A5A;
          line-height: 1.65;
          letter-spacing: 0.01em;
        }

        .suggest-hint {
          background: #EDE6D6;
          border: 1px solid #C8BEA8;
          padding: 16px 18px;
          margin-bottom: 2px;
          font-size: 13px;
          line-height: 1.65;
          color: #5A5040;
        }
        .suggest-hint strong { color: #7A5C2A; font-weight: 500; }

        .err { margin-top: 10px; font-size: 12px; color: #8B2020; }

        /* Success */
        .success {
          border: 1px solid #C4A96A;
          background: #EDE6D6;
          padding: 36px;
          text-align: center;
        }
        .success-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 32px;
          font-weight: 300;
          color: #1A1612;
          margin-bottom: 12px;
        }
        .success-body { font-size: 13px; color: #5A5040; line-height: 1.7; }

        /* Footer */
        .footer {
          border-top: 1px solid #D8D0C0;
          padding: 28px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          background: #EDE6D6;
        }
        @media(max-width: 700px) { .footer { padding: 24px; } }
        .footer-brand {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 16px;
          font-weight: 600;
          color: #1A1612;
        }
        .footer-copy { font-size: 11px; color: #8A7A5A; letter-spacing: 0.08em; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Top bar */}
      <div className="topbar">
        <span className="topbar-brand">District 1921</span>
        <span className="topbar-status">Pre-Launch &nbsp;·&nbsp; Q3 2025</span>
      </div>

      {/* Hero */}
      <div className="hero">
        <div className="hero-left">
          <p className="hero-eyebrow">District 1921 &nbsp;·&nbsp; All 50 States</p>
          <h1 className="hero-title">
            Built<br />
            for <em>us,</em><br />
            by us.
          </h1>
          <p className="hero-desc">
            A nationwide community business directory — discovery, trust, and economic solidarity in one place. Pre-registration is open now.
          </p>
        </div>
        <div className="hero-right">
          <div>
            <div className="hero-stat">
              <div className="hero-stat-num">50</div>
              <div className="hero-stat-label">States at launch</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">$15</div>
              <div className="hero-stat-label">Per month, flat — no upsells</div>
            </div>
          </div>
          <div className="hero-quote">
            <p>"We were not just a community. We were an institution."</p>
            <cite>On Greenwood, Tulsa — Black Wall Street</cite>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="section" style={{ animationDelay: '0.1s' }}>
        <div className="section-inner">
          <p className="sec-label">The Name</p>
          <div className="history-grid">
            <div className="history-body">
              <p>On May 31, 1921, the <strong>Greenwood District of Tulsa, Oklahoma</strong> — known the world over as <em>Black Wall Street</em> — was destroyed in one of the most devastating acts of racial violence in American history.</p>
              <p>Over 35 blocks of thriving businesses, homes, hospitals, and schools were burned to the ground in 18 hours. One of the wealthiest Black communities ever built in America. Gone.</p>
              <p><strong>District 1921 carries that name forward</strong> — not as a monument to what was lost, but as a foundation for what we're building now. The community will know. Everyone else will get curious.</p>
            </div>
            <div className="history-aside">
              <div className="aside-date">1921</div>
              <div className="aside-sublabel">Greenwood District, Tulsa</div>
              <ul className="aside-facts">
                <li>35+ blocks destroyed in 18 hours</li>
                <li>10,000 residents left homeless</li>
                <li>600+ businesses burned to the ground</li>
                <li>Called "Black Wall Street" for its prosperity</li>
                <li>One of the worst acts of racial violence in US history</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Pillars */}
      <div className="section" style={{ animationDelay: '0.15s' }}>
        <div className="section-inner">
          <p className="sec-label">What We're Building</p>
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
              <p className="pillar-body">Check-ins, follows, deals, events, jobs, and a request board connecting community needs to verified businesses.</p>
            </div>
            <div className="pillar">
              <p className="pillar-num">04</p>
              <p className="pillar-title">Ownership</p>
              <p className="pillar-body">$15/month flat. Analytics, leads, full business profile. No upsells, no ad dependency. Yours to own.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Seeding */}
      <div className="section" style={{ animationDelay: '0.2s' }}>
        <div className="section-inner">
          <p className="sec-label">Where We Are Now</p>
          <div className="seeding-grid">
            <div className="seeding-intro">
              We are actively pre-seeding the directory — researching and adding community businesses across the country so the platform has <strong>real depth from day one.</strong> We want you to see your city already populated when you open the doors.
            </div>
            <ul className="timeline">
              <li>
                <div className="tl-dot" />
                <div className="tl-text"><strong>Now</strong> — Pre-registration open. Community members and business owners can join the waitlist. Anyone can suggest a business.</div>
              </li>
              <li>
                <div className="tl-dot" />
                <div className="tl-text"><strong>Before launch</strong> — Owners of seeded businesses are contacted and invited to claim their listing.</div>
              </li>
              <li>
                <div className="tl-dot" />
                <div className="tl-text"><strong>Q3 2025</strong> — Full platform goes live. Search, map, Gold Shield, profiles, deals, events, jobs.</div>
              </li>
              <li>
                <div className="tl-dot" />
                <div className="tl-text"><strong>Early owners</strong> — Registered business owners get 3 months free when paid subscriptions launch.</div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="section" style={{ animationDelay: '0.25s' }}>
        <div className="section-inner">
          <p className="sec-label">Coming to the Platform</p>
          <div className="feat-grid">
            <div className="feat-card">
              <span className="feat-tag">Deals</span>
              <p className="feat-title">Community Deals</p>
              <p className="feat-desc">Business owners post exclusive offers. Followers get notified first. Browse deals across every category and city.</p>
            </div>
            <div className="feat-card">
              <span className="feat-tag">Events</span>
              <p className="feat-title">Local Events</p>
              <p className="feat-desc">Grand openings, pop-ups, community gatherings. Discover what's happening near you, searchable by city.</p>
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
              <span className="feat-tag">Verification</span>
              <p className="feat-title">Gold Shield</p>
              <p className="feat-desc">SOS lookup, phone check, web reachability, and a proof photo. Earned through real verification — not purchased.</p>
            </div>
            <div className="feat-card">
              <span className="feat-tag">Map</span>
              <p className="feat-title">Near Me</p>
              <p className="feat-desc">Clustered map pins, open-now filters, mobile service flags. Find community businesses wherever you are.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Registration */}
      <div className="reg-section">
        <div className="reg-inner">
          <div className="reg-copy">
            <p className="sec-label">Get Involved</p>
            <h2>Be first<br />through<br />the <em>doors.</em></h2>
            <p>Join the waitlist, register your business, or nominate one you love — we'll make sure it's in the directory on launch day.</p>
            <div className="reg-copy-stat">
              <p>Every business submitted gets researched and added to our seed data. <strong>The owner is contacted before we go live.</strong></p>
            </div>
          </div>

          <div className="reg-form">
            {status === 'done' ? (
              <div className="success">
                <p className="success-title">{mode === 'suggest' ? 'Submitted.' : "You're in."}</p>
                <p className="success-body">
                  {mode === 'suggest'
                    ? "We'll research it, add it to our seed data, and reach out to the owner before launch. Tell someone about District 1921."
                    : "We'll reach out when District 1921 opens its doors. In the meantime — tell someone."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="tabs">
                  <button type="button" className={`tab ${mode === 'community' ? 'active' : ''}`} onClick={() => setMode('community')}>Community</button>
                  <button type="button" className={`tab ${mode === 'owner' ? 'active' : ''}`} onClick={() => setMode('owner')}>Business Owner</button>
                  <button type="button" className={`tab ${mode === 'suggest' ? 'active' : ''}`} onClick={() => setMode('suggest')}>Suggest a Business</button>
                </div>

                {mode === 'suggest' ? (
                  <>
                    <div className="suggest-hint">
                      Know a community business that should be listed? Submit it here. <strong>We'll research it, add it to our seed data, and notify the owner before launch.</strong>
                    </div>
                    <div className="field"><input className="einput" type="text" placeholder="Business name" value={bizName} onChange={e => setBizName(e.target.value)} required /></div>
                    <div className="field"><input className="einput" type="text" placeholder="City, State  (e.g. Atlanta, GA)" value={bizCity} onChange={e => setBizCity(e.target.value)} required /></div>
                    <div className="field"><input className="einput" type="email" placeholder="Your email (optional)" value={email} onChange={e => setEmail(e.target.value)} /></div>
                  </>
                ) : (
                  <div className="field">
                    <input className="einput" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                )}

                <button type="submit" className="sbtn" disabled={status === 'loading' || (mode === 'suggest' ? !bizName || !bizCity : !email)}>
                  {status === 'loading' ? 'Submitting...' : mode === 'suggest' ? 'Submit Business' : 'Join Waitlist'}
                </button>

                {status === 'error' && <p className="err">Something went wrong. Try again.</p>}

                <p className="fnote">
                  {mode === 'community' && 'First access at launch. One email — no spam.'}
                  {mode === 'owner' && '3 months free at launch. One email — no spam.'}
                  {mode === 'suggest' && 'We research every submission. No spam, ever.'}
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <span className="footer-brand">District 1921</span>
        <span className="footer-copy">© 2025 &nbsp;·&nbsp; All 50 States &nbsp;·&nbsp; Built for the community</span>
      </div>
    </div>
  )
}
