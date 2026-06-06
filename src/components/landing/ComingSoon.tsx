'use client'
import { useState } from 'react'

export function ComingSoon() {
  const [email, setEmail] = useState('')
  const [type, setType] = useState<'community' | 'owner'>('community')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/preregister', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type }),
      })
      if (res.ok) {
        setStatus('done')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="coming-soon">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=DM+Mono:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .coming-soon {
          min-height: 100vh;
          background: #080806;
          color: #EDE8DF;
          font-family: 'DM Mono', monospace;
          overflow-x: hidden;
          position: relative;
        }

        /* Grain overlay */
        .coming-soon::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 1;
          opacity: 0.4;
        }

        .content {
          position: relative;
          z-index: 2;
          max-width: 780px;
          margin: 0 auto;
          padding: 80px 32px 120px;
        }

        /* ── Header ── */
        .eyebrow {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #C9A84C;
          margin-bottom: 48px;
          opacity: 0;
          animation: fadeUp 0.8s ease forwards;
        }

        .headline {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(56px, 10vw, 96px);
          font-weight: 300;
          line-height: 0.95;
          letter-spacing: -0.02em;
          color: #EDE8DF;
          margin-bottom: 8px;
          opacity: 0;
          animation: fadeUp 0.8s ease 0.1s forwards;
        }

        .headline em {
          font-style: italic;
          color: #C9A84C;
        }

        .year {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(56px, 10vw, 96px);
          font-weight: 700;
          line-height: 0.95;
          letter-spacing: -0.02em;
          color: #C9A84C;
          margin-bottom: 56px;
          opacity: 0;
          animation: fadeUp 0.8s ease 0.2s forwards;
        }

        /* ── Divider ── */
        .rule {
          width: 64px;
          height: 1px;
          background: #C9A84C;
          margin-bottom: 48px;
          opacity: 0;
          animation: fadeUp 0.8s ease 0.3s forwards;
        }

        /* ── History block ── */
        .history {
          margin-bottom: 64px;
          opacity: 0;
          animation: fadeUp 0.8s ease 0.4s forwards;
        }

        .history-label {
          font-size: 9px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #C9A84C;
          margin-bottom: 20px;
        }

        .history p {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(18px, 2.5vw, 22px);
          font-weight: 300;
          line-height: 1.7;
          color: #C8C4BC;
          margin-bottom: 20px;
        }

        .history p strong {
          color: #EDE8DF;
          font-weight: 600;
        }

        .history p em {
          color: #C9A84C;
          font-style: italic;
        }

        /* ── What we're building ── */
        .building {
          margin-bottom: 64px;
          opacity: 0;
          animation: fadeUp 0.8s ease 0.5s forwards;
        }

        .building-label {
          font-size: 9px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #C9A84C;
          margin-bottom: 24px;
        }

        .pillars {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2px;
        }

        @media (max-width: 560px) {
          .pillars { grid-template-columns: 1fr; }
        }

        .pillar {
          background: #0F0F0C;
          border: 1px solid #1E1E18;
          padding: 24px;
          transition: border-color 0.2s;
        }

        .pillar:hover {
          border-color: #C9A84C;
        }

        .pillar-num {
          font-size: 10px;
          letter-spacing: 0.2em;
          color: #C9A84C;
          margin-bottom: 12px;
        }

        .pillar-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 20px;
          font-weight: 600;
          color: #EDE8DF;
          margin-bottom: 8px;
        }

        .pillar-body {
          font-size: 11px;
          line-height: 1.7;
          color: #7A7870;
          letter-spacing: 0.01em;
        }

        /* ── Seeding notice ── */
        .seeding {
          background: #0F0F0C;
          border: 1px solid #1E1E18;
          border-left: 3px solid #C9A84C;
          padding: 28px 32px;
          margin-bottom: 64px;
          opacity: 0;
          animation: fadeUp 0.8s ease 0.6s forwards;
        }

        .seeding-label {
          font-size: 9px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #C9A84C;
          margin-bottom: 16px;
        }

        .seeding p {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 18px;
          font-weight: 300;
          line-height: 1.7;
          color: #C8C4BC;
          margin-bottom: 12px;
        }

        .seeding p:last-child { margin-bottom: 0; }

        .seeding ul {
          list-style: none;
          margin-top: 16px;
        }

        .seeding ul li {
          font-size: 11px;
          color: #7A7870;
          padding: 6px 0;
          border-bottom: 1px solid #1A1A16;
          display: flex;
          gap: 12px;
          letter-spacing: 0.02em;
        }

        .seeding ul li::before {
          content: '→';
          color: #C9A84C;
          flex-shrink: 0;
        }

        .seeding ul li:last-child { border-bottom: none; }

        /* ── Form ── */
        .form-section {
          opacity: 0;
          animation: fadeUp 0.8s ease 0.7s forwards;
        }

        .form-label {
          font-size: 9px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #C9A84C;
          margin-bottom: 24px;
        }

        .toggle {
          display: flex;
          margin-bottom: 24px;
          border: 1px solid #1E1E18;
          overflow: hidden;
        }

        .toggle-btn {
          flex: 1;
          padding: 12px;
          background: transparent;
          border: none;
          color: #7A7870;
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
        }

        .toggle-btn.active {
          background: #C9A84C;
          color: #080806;
        }

        .toggle-btn:not(.active):hover {
          color: #EDE8DF;
          background: #1A1A16;
        }

        .form-row {
          display: flex;
          gap: 2px;
        }

        .email-input {
          flex: 1;
          padding: 16px 20px;
          background: #0F0F0C;
          border: 1px solid #1E1E18;
          border-right: none;
          color: #EDE8DF;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          outline: none;
          transition: border-color 0.2s;
          letter-spacing: 0.02em;
        }

        .email-input::placeholder { color: #3A3A34; }

        .email-input:focus {
          border-color: #C9A84C;
        }

        .submit-btn {
          padding: 16px 32px;
          background: #C9A84C;
          border: none;
          color: #080806;
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
        }

        .submit-btn:hover { background: #E8C87A; }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .form-note {
          margin-top: 16px;
          font-size: 10px;
          color: #3A3A34;
          letter-spacing: 0.05em;
          line-height: 1.6;
        }

        /* ── Success state ── */
        .success {
          background: #0F0F0C;
          border: 1px solid #C9A84C;
          padding: 32px;
          text-align: center;
        }

        .success-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 28px;
          font-weight: 300;
          color: #C9A84C;
          margin-bottom: 12px;
        }

        .success-body {
          font-size: 11px;
          color: #7A7870;
          line-height: 1.7;
          letter-spacing: 0.02em;
        }

        /* ── Footer ── */
        .footer {
          margin-top: 96px;
          padding-top: 32px;
          border-top: 1px solid #1A1A16;
          display: flex;
          justify-content: space-between;
          align-items: center;
          opacity: 0;
          animation: fadeUp 0.8s ease 0.9s forwards;
          flex-wrap: wrap;
          gap: 16px;
        }

        .footer-brand {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 16px;
          font-weight: 600;
          color: #C9A84C;
          letter-spacing: 0.05em;
        }

        .footer-copy {
          font-size: 10px;
          color: #3A3A34;
          letter-spacing: 0.1em;
        }

        /* ── Animations ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── Background accent ── */
        .bg-accent {
          position: fixed;
          top: -200px;
          right: -200px;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
      `}</style>

      <div className="bg-accent" />

      <div className="content">
        <p className="eyebrow">District 1921 &nbsp;·&nbsp; Est. 2025 &nbsp;·&nbsp; All 50 States</p>

        <h1 className="headline">Built for <em>us,</em></h1>
        <p className="year">by us.</p>

        <div className="rule" />

        <div className="history">
          <p className="history-label">The Name</p>
          <p>
            On May 31, 1921, the <strong>Greenwood District of Tulsa, Oklahoma</strong> — known the world over
            as <em>Black Wall Street</em> — was destroyed in one of the most devastating acts of racial
            violence in American history. Over 35 blocks of thriving Black-owned businesses, homes,
            hospitals, and schools were burned to the ground.
          </p>
          <p>
            It was one of the wealthiest Black communities America had ever produced. Built from nothing.
            Burned in 18 hours. <strong>District 1921 carries that name forward.</strong>
          </p>
          <p>
            Not as a monument to what was lost — but as a foundation for what we're building now.
            The community will know. Everyone else will get curious.
          </p>
        </div>

        <div className="building">
          <p className="building-label">What We're Building</p>
          <div className="pillars">
            <div className="pillar">
              <p className="pillar-num">01</p>
              <p className="pillar-title">Discovery</p>
              <p className="pillar-body">Search and find community businesses across every city in all 50 states. Map-first, mobile-first, community-driven.</p>
            </div>
            <div className="pillar">
              <p className="pillar-num">02</p>
              <p className="pillar-title">Trust</p>
              <p className="pillar-body">The Gold Shield — earned through real verification, not a checkbox. SOS lookup, phone, web, and a proof photo. Community-trusted.</p>
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

        <div className="seeding">
          <p className="seeding-label">Where We Are Now</p>
          <p>
            We are actively pre-seeding the directory — researching and adding community businesses
            across the country before launch so the platform has real depth from day one.
          </p>
          <p>
            Here's what to expect:
          </p>
          <ul>
            <li>Pre-registered community members get first access when we open the doors</li>
            <li>Business owners will be notified if we've already added their listing and can claim it</li>
            <li>The full platform — search, map, profiles, Gold Shield — goes live Q3 2025</li>
            <li>Early registered owners get 3 months free when we launch paid subscriptions</li>
          </ul>
        </div>

        <div className="form-section">
          <p className="form-label">Join the waitlist</p>

          {status === 'done' ? (
            <div className="success">
              <p className="success-title">You're in.</p>
              <p className="success-body">
                We'll reach out as soon as District 1921 opens its doors.<br />
                In the meantime — tell someone.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="toggle">
                <button
                  type="button"
                  className={`toggle-btn ${type === 'community' ? 'active' : ''}`}
                  onClick={() => setType('community')}
                >
                  Community Member
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${type === 'owner' ? 'active' : ''}`}
                  onClick={() => setType('owner')}
                >
                  Business Owner
                </button>
              </div>
              <div className="form-row">
                <input
                  className="email-input"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={status === 'loading' || !email}
                >
                  {status === 'loading' ? 'Adding...' : 'Register'}
                </button>
              </div>
              {status === 'error' && (
                <p style={{ marginTop: '12px', fontSize: '11px', color: '#E85454' }}>
                  Something went wrong. Try again.
                </p>
              )}
              <p className="form-note">
                No spam. One email when we launch, one if we find your business in our seed data.
                {type === 'owner' && ' Business owners get 3 months free at launch.'}
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
