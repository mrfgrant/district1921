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
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --green-deep: #1a3a2a;
          --green-mid: #2d6a4f;
          --green-light: #40916c;
          --green-pale: #d8f3dc;
          --gold: #c9a84c;
          --gold-light: #f5e6c0;
          --cream: #faf7f0;
          --ink: #1c1c1c;
          --muted: #6b7280;
          --border: #e5e0d5;
          --white: #ffffff;
        }

        .cs {
          min-height: 100vh;
          background: var(--cream);
          color: var(--ink);
          font-family: 'DM Sans', sans-serif;
        }

        /* ── HEADER ── */
        .cs-header {
          background: var(--green-deep);
          padding: 0 32px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 2px 20px rgba(0,0,0,0.3);
        }
        .cs-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .cs-logo-icon {
          width: 34px;
          height: 34px;
          background: var(--gold);
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
        }
        .cs-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 900;
          color: var(--white);
        }
        .cs-logo-text span { color: var(--gold); }
        .cs-badge {
          background: rgba(201,168,76,0.15);
          border: 1px solid rgba(201,168,76,0.3);
          color: var(--gold);
          font-size: 10px;
          font-family: 'DM Mono', monospace;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 4px;
        }

        /* ── HERO ── */
        .cs-hero {
          background: linear-gradient(135deg, var(--green-deep) 0%, var(--green-mid) 60%, #1a4a35 100%);
          padding: 72px 32px 64px;
          position: relative;
          overflow: hidden;
        }
        .cs-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 15% 50%, rgba(201,168,76,0.08) 0%, transparent 55%),
            radial-gradient(circle at 85% 20%, rgba(64,145,108,0.12) 0%, transparent 45%);
        }
        .cs-hero-inner {
          position: relative;
          max-width: 960px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
        }
        @media(max-width:680px){.cs-hero-inner{grid-template-columns:1fr;gap:40px}}

        .cs-hero-left {}
        .cs-hero-eyebrow {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 20px;
          opacity: 0;
          animation: csfu 0.8s ease forwards;
        }
        .cs-hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(42px, 6vw, 64px);
          font-weight: 900;
          color: var(--white);
          line-height: 1.05;
          margin-bottom: 20px;
          opacity: 0;
          animation: csfu 0.8s ease 0.1s forwards;
        }
        .cs-hero-title em {
          font-style: italic;
          color: var(--gold);
          font-weight: 700;
        }
        .cs-hero-sub {
          font-size: 15px;
          line-height: 1.7;
          color: rgba(255,255,255,0.65);
          margin-bottom: 28px;
          max-width: 380px;
          opacity: 0;
          animation: csfu 0.8s ease 0.2s forwards;
        }

        /* free directory callout */
        .cs-free-box {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.15);
          border-left: 3px solid var(--gold);
          padding: 16px 20px;
          margin-bottom: 28px;
          opacity: 0;
          animation: csfu 0.8s ease 0.25s forwards;
        }
        .cs-free-box p {
          font-size: 13px;
          line-height: 1.65;
          color: rgba(255,255,255,0.8);
          margin: 0;
        }
        .cs-free-box strong { color: var(--gold); }
        .cs-free-box a {
          color: var(--gold);
          text-decoration: underline;
          text-underline-offset: 2px;
          cursor: pointer;
        }

        .cs-hero-pills {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          opacity: 0;
          animation: csfu 0.8s ease 0.3s forwards;
        }
        .cs-pill {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
          color: rgba(255,255,255,0.8);
          padding: 5px 13px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        /* right side stats */
        .cs-hero-right {
          display: flex;
          flex-direction: column;
          gap: 20px;
          opacity: 0;
          animation: csfu 0.8s ease 0.2s forwards;
        }
        .cs-stat-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2px;
        }
        .cs-stat {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 20px;
        }
        .cs-stat-num {
          font-family: 'Playfair Display', serif;
          font-size: 36px;
          font-weight: 700;
          color: var(--gold);
          line-height: 1;
          margin-bottom: 4px;
        }
        .cs-stat-label {
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          line-height: 1.4;
        }
        .cs-quote {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-left: 3px solid var(--gold);
          padding: 20px 22px;
        }
        .cs-quote p {
          font-family: 'Playfair Display', serif;
          font-size: 16px;
          font-style: italic;
          font-weight: 700;
          line-height: 1.55;
          color: rgba(255,255,255,0.85);
          margin-bottom: 10px;
        }
        .cs-quote cite {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold);
          font-style: normal;
        }

        /* ── SECTIONS ── */
        .cs-section {
          padding: 64px 32px;
          border-bottom: 1px solid var(--border);
          opacity: 0;
          animation: csfu 0.8s ease forwards;
        }
        .cs-section-inner { max-width: 960px; margin: 0 auto; }

        .cs-sec-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--green-mid);
          margin-bottom: 32px;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .cs-sec-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border);
          max-width: 100px;
        }

        /* ── PRICING CLARITY ── */
        .cs-pricing {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2px;
          margin-bottom: 0;
        }
        @media(max-width:680px){.cs-pricing{grid-template-columns:1fr}}

        .cs-price-card {
          padding: 32px;
          border: 1px solid var(--border);
        }
        .cs-price-card.free-card { background: var(--white); }
        .cs-price-card.paid-card { background: var(--green-deep); color: var(--white); }

        .price-tier {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .free-card .price-tier { color: var(--green-mid); }
        .paid-card .price-tier { color: var(--gold); }

        .price-amount {
          font-family: 'Playfair Display', serif;
          font-size: 42px;
          font-weight: 900;
          line-height: 1;
          margin-bottom: 4px;
        }
        .free-card .price-amount { color: var(--ink); }
        .paid-card .price-amount { color: var(--white); }

        .price-period {
          font-size: 13px;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border);
        }
        .paid-card .price-period { border-color: rgba(255,255,255,0.15); color: rgba(255,255,255,0.6); }
        .free-card .price-period { color: var(--muted); }

        .price-features { list-style: none; }
        .price-features li {
          font-size: 13px;
          line-height: 1.6;
          padding: 7px 0;
          border-bottom: 1px solid var(--border);
          display: flex;
          gap: 10px;
        }
        .paid-card .price-features li { border-color: rgba(255,255,255,0.1); color: rgba(255,255,255,0.85); }
        .free-card .price-features li { color: var(--muted); }
        .price-features li:last-child { border-bottom: none; }
        .price-features li::before { content: '✓'; flex-shrink: 0; }
        .free-card .price-features li::before { color: var(--green-mid); }
        .paid-card .price-features li::before { color: var(--gold); }

        .price-note {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--border);
          font-size: 12px;
          line-height: 1.6;
        }
        .paid-card .price-note { border-color: rgba(255,255,255,0.15); color: rgba(255,255,255,0.5); }
        .free-card .price-note { color: var(--muted); }

        /* ── HISTORY ── */
        .cs-history-grid {
          display: grid;
          grid-template-columns: 3fr 2fr;
          gap: 48px;
        }
        @media(max-width:680px){.cs-history-grid{grid-template-columns:1fr;gap:32px}}

        .cs-history-body p {
          font-family: 'Playfair Display', serif;
          font-size: clamp(17px, 2vw, 20px);
          font-weight: 700;
          line-height: 1.7;
          color: var(--ink);
          margin-bottom: 20px;
        }
        .cs-history-body p.body-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 400;
          color: var(--muted);
        }
        .cs-history-body strong { color: var(--green-deep); }
        .cs-history-body em { font-style: italic; color: var(--green-mid); }

        .cs-history-aside {
          background: var(--green-deep);
          padding: 28px;
          color: var(--white);
        }
        .aside-year {
          font-family: 'Playfair Display', serif;
          font-size: 56px;
          font-weight: 900;
          color: var(--gold);
          line-height: 1;
          margin-bottom: 4px;
        }
        .aside-place {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .aside-facts { list-style: none; }
        .aside-facts li {
          font-size: 12px;
          line-height: 1.6;
          color: rgba(255,255,255,0.7);
          padding: 8px 0;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          display: flex;
          gap: 10px;
        }
        .aside-facts li:last-child { border-bottom: none; }
        .aside-facts li::before { content: '—'; color: var(--gold); flex-shrink: 0; }

        /* ── PILLARS ── */
        .cs-pillars {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          border: 1px solid var(--border);
        }
        @media(max-width:680px){.cs-pillars{grid-template-columns:1fr 1fr}}
        .cs-pillar {
          padding: 28px 24px;
          border-right: 1px solid var(--border);
          transition: background 0.2s;
        }
        .cs-pillar:last-child { border-right: none; }
        @media(max-width:680px){
          .cs-pillar:nth-child(2){border-right:none}
          .cs-pillar:nth-child(1),.cs-pillar:nth-child(2){border-bottom:1px solid var(--border)}
        }
        .cs-pillar:hover { background: var(--green-pale); }
        .cs-pillar-num { font-family:'DM Mono',monospace; font-size:10px; letter-spacing:0.2em; color:var(--gold); margin-bottom:14px; }
        .cs-pillar-title { font-family:'Playfair Display',serif; font-size:22px; font-weight:700; color:var(--ink); margin-bottom:10px; }
        .cs-pillar-body { font-size:13px; line-height:1.75; color:var(--muted); }

        /* ── SEEDING ── */
        .cs-seeding-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
        }
        @media(max-width:680px){.cs-seeding-grid{grid-template-columns:1fr;gap:32px}}

        .cs-seeding-intro {
          font-family: 'Playfair Display', serif;
          font-size: clamp(17px, 2vw, 19px);
          font-weight: 700;
          line-height: 1.7;
          color: var(--ink);
        }
        .cs-seeding-intro strong { color: var(--green-deep); }

        .cs-timeline { list-style: none; }
        .cs-timeline li {
          display: flex;
          gap: 16px;
          padding: 14px 0;
          border-bottom: 1px solid var(--border);
        }
        .cs-timeline li:last-child { border-bottom: none; }
        .tl-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--gold); margin-top: 6px; flex-shrink: 0; }
        .tl-text { font-size: 13px; line-height: 1.65; color: var(--muted); }
        .tl-text strong { color: var(--ink); font-weight: 600; }

        /* ── FEATURES ── */
        .cs-feat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border: 1px solid var(--border);
        }
        @media(max-width:680px){.cs-feat-grid{grid-template-columns:1fr 1fr}}
        @media(max-width:440px){.cs-feat-grid{grid-template-columns:1fr}}

        .cs-feat {
          padding: 24px;
          border-right: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          transition: background 0.2s;
        }
        .cs-feat:nth-child(3n){border-right:none}
        .cs-feat:nth-last-child(-n+3){border-bottom:none}
        @media(max-width:680px){
          .cs-feat:nth-child(3n){border-right:1px solid var(--border)}
          .cs-feat:nth-child(2n){border-right:none}
        }
        .cs-feat:hover { background: var(--green-pale); }
        .cs-feat-tag { font-family:'DM Mono',monospace; font-size:9px; letter-spacing:0.22em; text-transform:uppercase; color:var(--green-mid); margin-bottom:12px; display:block; }
        .cs-feat-title { font-family:'Playfair Display',serif; font-size:18px; font-weight:700; color:var(--ink); margin-bottom:8px; }
        .cs-feat-desc { font-size:13px; line-height:1.75; color:var(--muted); }

        /* ── PREVIEW LINK ── */
        .cs-preview {
          background: var(--green-deep);
          padding: 48px 32px;
          text-align: center;
        }
        .cs-preview-inner { max-width: 600px; margin: 0 auto; }
        .cs-preview h3 {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 900;
          color: var(--white);
          margin-bottom: 12px;
        }
        .cs-preview p {
          font-size: 14px;
          line-height: 1.65;
          color: rgba(255,255,255,0.6);
          margin-bottom: 24px;
        }
        .cs-preview-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--gold);
          color: var(--green-deep);
          padding: 13px 28px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
          border-radius: 6px;
        }
        .cs-preview-btn:hover { background: #dbb95a; }

        /* ── REGISTRATION ── */
        .cs-reg {
          padding: 64px 32px 80px;
          background: var(--white);
        }
        .cs-reg-inner {
          max-width: 960px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: start;
        }
        @media(max-width:680px){.cs-reg-inner{grid-template-columns:1fr;gap:40px}}

        .cs-reg-copy h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 4vw, 44px);
          font-weight: 900;
          line-height: 1.1;
          color: var(--ink);
          margin-bottom: 16px;
        }
        .cs-reg-copy h2 em { font-style: italic; color: var(--green-mid); }
        .cs-reg-copy p {
          font-size: 14px;
          line-height: 1.75;
          color: var(--muted);
          margin-bottom: 24px;
        }
        .cs-reg-note {
          background: var(--gold-light);
          border: 1px solid #e8d090;
          border-left: 3px solid var(--gold);
          padding: 14px 18px;
          font-size: 13px;
          line-height: 1.65;
          color: #5a4a20;
        }
        .cs-reg-note strong { color: #3a2e10; }

        /* Form */
        .cs-tabs {
          display: flex;
          border: 1px solid var(--border);
          margin-bottom: 20px;
          border-radius: 6px;
          overflow: hidden;
        }
        .cs-tab {
          flex: 1;
          padding: 11px 8px;
          background: transparent;
          border: none;
          border-right: 1px solid var(--border);
          color: var(--muted);
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          letter-spacing: 0.06em;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.18s;
          text-align: center;
        }
        .cs-tab:last-child { border-right: none; }
        .cs-tab.active { background: var(--green-deep); color: var(--white); }
        .cs-tab:not(.active):hover { background: var(--green-pale); color: var(--ink); }

        .cs-field { margin-bottom: 2px; }
        .cs-input {
          width: 100%;
          padding: 13px 16px;
          background: var(--cream);
          border: 1px solid var(--border);
          color: var(--ink);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.18s;
          border-radius: 4px;
        }
        .cs-input::placeholder { color: #b0a898; }
        .cs-input:focus { border-color: var(--green-mid); background: var(--white); }

        .cs-suggest-hint {
          background: var(--green-pale);
          border: 1px solid #b8e0c4;
          padding: 14px 16px;
          font-size: 13px;
          line-height: 1.65;
          color: var(--green-deep);
          margin-bottom: 2px;
          border-radius: 4px;
        }
        .cs-suggest-hint strong { font-weight: 600; }

        .cs-sbtn {
          width: 100%;
          margin-top: 2px;
          padding: 14px;
          background: var(--green-deep);
          border: none;
          color: var(--white);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: background 0.18s;
          border-radius: 4px;
        }
        .cs-sbtn:hover { background: var(--green-mid); }
        .cs-sbtn:disabled { opacity: 0.4; cursor: not-allowed; }

        .cs-fnote {
          margin-top: 12px;
          font-size: 11px;
          color: var(--muted);
          line-height: 1.65;
        }
        .cs-err { margin-top: 10px; font-size: 12px; color: #8B2020; }

        .cs-success {
          border: 1px solid var(--green-light);
          background: var(--green-pale);
          padding: 32px;
          text-align: center;
          border-radius: 6px;
        }
        .cs-success-title {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 700;
          color: var(--green-deep);
          margin-bottom: 10px;
        }
        .cs-success-body { font-size: 13px; color: var(--green-mid); line-height: 1.7; }

        /* ── FOOTER ── */
        .cs-footer {
          background: var(--green-deep);
          padding: 28px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }
        .cs-footer-brand {
          font-family: 'Playfair Display', serif;
          font-size: 17px;
          font-weight: 900;
          color: var(--white);
        }
        .cs-footer-brand span { color: var(--gold); }
        .cs-footer-copy { font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.08em; }

        @keyframes csfu { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header */}
      <header className="cs-header">
        <div className="cs-logo">
          <div className="cs-logo-icon">🏛</div>
          <span className="cs-logo-text">District <span>1921</span></span>
        </div>
        <span className="cs-badge">Pre-Launch &nbsp;·&nbsp; Q3 2025</span>
      </header>

      {/* Hero */}
      <div className="cs-hero">
        <div className="cs-hero-inner">
          <div className="cs-hero-left">
            <p className="cs-hero-eyebrow">District 1921 &nbsp;·&nbsp; All 50 States</p>
            <h1 className="cs-hero-title">
              The community<br />
              business directory<br />
              <em>built for us.</em>
            </h1>
            <p className="cs-hero-sub">
              A nationwide directory where community members discover, share, and support businesses — and owners build a real presence. Free to search. Free to list.
            </p>
            <div className="cs-free-box">
              <p>
                <strong>The directory is free.</strong> Any community member can add a business listing at no cost. <strong>Professional business pages</strong> — full profiles, photos, analytics, deals, events, and leads — start at $15/month.{' '}
                <a href="#pricing">See what's included →</a>
              </p>
            </div>
            <div className="cs-hero-pills">
              <span className="cs-pill">🍽 Food & Dining</span>
              <span className="cs-pill">💇 Beauty & Wellness</span>
              <span className="cs-pill">⚖️ Legal & Finance</span>
              <span className="cs-pill">🏗 Contractors</span>
              <span className="cs-pill">🩺 Healthcare</span>
            </div>
          </div>
          <div className="cs-hero-right">
            <div className="cs-stat-row">
              <div className="cs-stat">
                <div className="cs-stat-num">50</div>
                <div className="cs-stat-label">States at launch</div>
              </div>
              <div className="cs-stat">
                <div className="cs-stat-num">Free</div>
                <div className="cs-stat-label">To list your business</div>
              </div>
              <div className="cs-stat">
                <div className="cs-stat-num">$15</div>
                <div className="cs-stat-label">Per month for a full page</div>
              </div>
              <div className="cs-stat">
                <div className="cs-stat-num">12</div>
                <div className="cs-stat-label">Business categories</div>
              </div>
            </div>
            <div className="cs-quote">
              <p>"We were not just a community. We were an institution."</p>
              <cite>On Greenwood — Black Wall Street, Tulsa 1921</cite>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing clarity */}
      <div className="cs-section" id="pricing" style={{ animationDelay: '0.1s' }}>
        <div className="cs-section-inner">
          <p className="cs-sec-label">How it works</p>
          <div className="cs-pricing">
            <div className="cs-price-card free-card">
              <p className="price-tier">Free Listing</p>
              <p className="price-amount">$0</p>
              <p className="price-period">Forever free — no credit card</p>
              <ul className="price-features">
                <li>Appears in search results</li>
                <li>Business name, category, city</li>
                <li>Community ratings (3–5 stars)</li>
                <li>Check-ins and follows</li>
                <li>Any signed-in member can add a business</li>
              </ul>
              <p className="price-note">The directory grows through the community. Anyone can add a listing — owners and members alike.</p>
            </div>
            <div className="cs-price-card paid-card">
              <p className="price-tier">Professional Page</p>
              <p className="price-amount">$15<span style={{fontSize:'18px',fontWeight:400}}>/mo</span></p>
              <p className="price-period">$90 billed every 6 months · auto-renews</p>
              <ul className="price-features">
                <li>Everything in Free, plus:</li>
                <li>Full business profile with logo & photos</li>
                <li>Hours, contact info, website</li>
                <li>Post deals, events, and job listings</li>
                <li>Receive community leads directly</li>
                <li>Analytics — views, clicks, check-ins</li>
                <li>Gold Shield verification ($25 one-time)</li>
                <li>Priority placement in search results</li>
              </ul>
              <p className="price-note">Early registered owners get 3 months free at launch.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Preview link */}
      <div className="cs-preview">
        <div className="cs-preview-inner">
          <h3>See what a business page looks like</h3>
          <p>We've built a concept showing exactly what a paid professional page looks like — search results, map view, full business profile, and the Gold Shield verification badge.</p>
          <a
            href="/preview"
            className="cs-preview-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Platform Preview →
          </a>
        </div>
      </div>

      {/* History */}
      <div className="cs-section" style={{ animationDelay: '0.15s' }}>
        <div className="cs-section-inner">
          <p className="cs-sec-label">The Name</p>
          <div className="cs-history-grid">
            <div className="cs-history-body">
              <p>On May 31, 1921, the <strong>Greenwood District of Tulsa, Oklahoma</strong> — known the world over as <em>Black Wall Street</em> — was destroyed in one of the most devastating acts of racial violence in American history.</p>
              <p className="body-text">Over 35 blocks of thriving businesses, homes, hospitals, and schools burned to the ground in 18 hours. One of the wealthiest Black communities ever built in America. Gone overnight.</p>
              <p className="body-text"><strong>District 1921 carries that name forward</strong> — not as a monument to what was lost, but as a foundation for what we're building now. The community will know. Everyone else will get curious.</p>
            </div>
            <div className="cs-history-aside">
              <div className="aside-year">1921</div>
              <div className="aside-place">Greenwood District, Tulsa</div>
              <ul className="aside-facts">
                <li>35+ blocks destroyed in 18 hours</li>
                <li>10,000 residents left homeless</li>
                <li>600+ businesses burned to the ground</li>
                <li>Called "Black Wall Street" for its wealth</li>
                <li>One of the worst acts of racial violence in US history</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Pillars */}
      <div className="cs-section" style={{ animationDelay: '0.2s' }}>
        <div className="cs-section-inner">
          <p className="cs-sec-label">What We're Building</p>
          <div className="cs-pillars">
            <div className="cs-pillar"><p className="cs-pillar-num">01</p><p className="cs-pillar-title">Discovery</p><p className="cs-pillar-body">Search community businesses across every city in all 50 states. Map-first, mobile-first, community-driven.</p></div>
            <div className="cs-pillar"><p className="cs-pillar-num">02</p><p className="cs-pillar-title">Trust</p><p className="cs-pillar-body">The Gold Shield — earned through real verification. SOS lookup, phone check, web, and a proof photo.</p></div>
            <div className="cs-pillar"><p className="cs-pillar-num">03</p><p className="cs-pillar-title">Community</p><p className="cs-pillar-body">Check-ins, follows, deals, events, jobs, and a request board connecting needs to verified businesses.</p></div>
            <div className="cs-pillar"><p className="cs-pillar-num">04</p><p className="cs-pillar-title">Ownership</p><p className="cs-pillar-body">$15/month flat. Full profile, analytics, leads. No upsells. No ad dependency. Yours to own.</p></div>
          </div>
        </div>
      </div>

      {/* Seeding */}
      <div className="cs-section" style={{ animationDelay: '0.22s' }}>
        <div className="cs-section-inner">
          <p className="cs-sec-label">Where We Are Now</p>
          <div className="cs-seeding-grid">
            <div className="cs-seeding-intro">
              We are actively pre-seeding the directory — researching and adding community businesses across the country so the platform has <strong>real depth from day one.</strong> We want you to see your city already populated when the doors open.
            </div>
            <ul className="cs-timeline">
              <li><div className="tl-dot"/><div className="tl-text"><strong>Now</strong> — Pre-registration open. Join the waitlist, register your business, or suggest one you want to see in the directory.</div></li>
              <li><div className="tl-dot"/><div className="tl-text"><strong>Before launch</strong> — Owners of seeded businesses are contacted and invited to claim their listing.</div></li>
              <li><div className="tl-dot"/><div className="tl-text"><strong>Q3 2025</strong> — Full platform goes live with search, map, Gold Shield, profiles, deals, events, and jobs.</div></li>
              <li><div className="tl-dot"/><div className="tl-text"><strong>Early owners</strong> — Registered owners get 3 months free when paid pages launch.</div></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="cs-section" style={{ animationDelay: '0.25s' }}>
        <div className="cs-section-inner">
          <p className="cs-sec-label">Coming to the Platform</p>
          <div className="cs-feat-grid">
            <div className="cs-feat"><span className="cs-feat-tag">Deals</span><p className="cs-feat-title">Community Deals</p><p className="cs-feat-desc">Owners post exclusive offers. Followers get notified first. Browse deals across every category and city.</p></div>
            <div className="cs-feat"><span className="cs-feat-tag">Events</span><p className="cs-feat-title">Local Events</p><p className="cs-feat-desc">Grand openings, pop-ups, community gatherings. Discover what's happening near you by city.</p></div>
            <div className="cs-feat"><span className="cs-feat-tag">Jobs</span><p className="cs-feat-title">Job Board</p><p className="cs-feat-desc">Community businesses hiring community members. 30-day listings, direct applications, no middleman.</p></div>
            <div className="cs-feat"><span className="cs-feat-tag">Requests</span><p className="cs-feat-title">Request Board</p><p className="cs-feat-desc">"I need a plumber in Atlanta." Post a need, get matched to verified local businesses.</p></div>
            <div className="cs-feat"><span className="cs-feat-tag">Verification</span><p className="cs-feat-title">Gold Shield</p><p className="cs-feat-desc">SOS lookup, phone check, web reachability, and a proof photo. Earned through real verification.</p></div>
            <div className="cs-feat"><span className="cs-feat-tag">Map</span><p className="cs-feat-title">Near Me</p><p className="cs-feat-desc">Clustered pins, open-now filters, mobile service flags. Find community businesses wherever you are.</p></div>
          </div>
        </div>
      </div>

      {/* Registration */}
      <div className="cs-reg">
        <div className="cs-reg-inner">
          <div className="cs-reg-copy">
            <p className="cs-sec-label">Get Involved</p>
            <h2>Be first<br /><em>through the doors.</em></h2>
            <p>Join the waitlist, register your business, or nominate one you love — we'll make sure it's in the directory on launch day.</p>
            <div className="cs-reg-note">
              Every business submitted gets researched and added to our seed data. <strong>The owner is contacted before we go live.</strong> Early registered owners get 3 months free.
            </div>
          </div>
          <div>
            {status === 'done' ? (
              <div className="cs-success">
                <p className="cs-success-title">{mode === 'suggest' ? 'Submitted.' : "You're in."}</p>
                <p className="cs-success-body">
                  {mode === 'suggest'
                    ? "We'll research it, add it to our seed data, and reach out to the owner before launch."
                    : "We'll reach out when District 1921 opens its doors. Tell someone."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="cs-tabs">
                  <button type="button" className={`cs-tab ${mode === 'community' ? 'active' : ''}`} onClick={() => setMode('community')}>Community</button>
                  <button type="button" className={`cs-tab ${mode === 'owner' ? 'active' : ''}`} onClick={() => setMode('owner')}>Business Owner</button>
                  <button type="button" className={`cs-tab ${mode === 'suggest' ? 'active' : ''}`} onClick={() => setMode('suggest')}>Suggest a Business</button>
                </div>
                {mode === 'suggest' ? (
                  <>
                    <div className="cs-suggest-hint">Know a business that should be listed? <strong>We'll research it, add it to our seed data, and notify the owner before launch.</strong></div>
                    <div className="cs-field"><input className="cs-input" type="text" placeholder="Business name" value={bizName} onChange={e => setBizName(e.target.value)} required /></div>
                    <div className="cs-field"><input className="cs-input" type="text" placeholder="City, State  (e.g. Atlanta, GA)" value={bizCity} onChange={e => setBizCity(e.target.value)} required /></div>
                    <div className="cs-field"><input className="cs-input" type="email" placeholder="Your email (optional)" value={email} onChange={e => setEmail(e.target.value)} /></div>
                  </>
                ) : (
                  <div className="cs-field">
                    <input className="cs-input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                )}
                <button type="submit" className="cs-sbtn" disabled={status === 'loading' || (mode === 'suggest' ? !bizName || !bizCity : !email)}>
                  {status === 'loading' ? 'Submitting...' : mode === 'suggest' ? 'Submit Business' : 'Join Waitlist'}
                </button>
                {status === 'error' && <p className="cs-err">Something went wrong. Try again.</p>}
                <p className="cs-fnote">
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
      <footer className="cs-footer">
        <span className="cs-footer-brand">District <span>1921</span></span>
        <span className="cs-footer-copy">© 2025 &nbsp;·&nbsp; All 50 States &nbsp;·&nbsp; Built for the community</span>
      </footer>
    </div>
  )
}
