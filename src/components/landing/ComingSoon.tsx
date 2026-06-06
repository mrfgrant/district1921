'use client'
import { useState } from 'react'
import Image from 'next/image'

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
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

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
          padding: 0 40px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 50;
          box-shadow: 0 2px 20px rgba(0,0,0,0.3);
        }
        .cs-logo { display: flex; align-items: center; gap: 10px; }
        .cs-logo-icon {
          width: 34px; height: 34px;
          background: var(--gold);
          border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }
        .cs-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 900;
          color: var(--white);
        }
        .cs-logo-text span { color: var(--gold); }
        .cs-badge {
          background: rgba(201,168,76,0.15);
          border: 1px solid rgba(201,168,76,0.3);
          color: var(--gold);
          font-size: 10px; font-family: 'DM Mono', monospace;
          letter-spacing: 0.2em; text-transform: uppercase;
          padding: 5px 12px; border-radius: 4px;
        }

        /* ── HERO — full bleed image ── */
        .cs-hero {
          position: relative;
          height: 580px;
          overflow: hidden;
        }
        @media(max-width:680px) { .cs-hero { height: 420px; } }

        .cs-hero-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center 30%;
        }

        /* gradient overlay: dark at bottom for text legibility */
        .cs-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(10,25,18,0.25) 0%,
            rgba(10,25,18,0.15) 40%,
            rgba(10,25,18,0.72) 75%,
            rgba(10,25,18,0.92) 100%
          );
        }

        .cs-hero-content {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 0 48px 48px;
          max-width: 960px;
        }
        @media(max-width:680px) { .cs-hero-content { padding: 0 24px 36px; } }

        .cs-hero-eyebrow {
          font-family: 'DM Mono', monospace;
          font-size: 10px; letter-spacing: 0.3em;
          text-transform: uppercase; color: var(--gold);
          margin-bottom: 14px;
          opacity: 0; animation: csfu 0.8s ease forwards;
        }
        .cs-hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(38px, 6vw, 64px);
          font-weight: 900; line-height: 1.05; color: var(--white);
          margin-bottom: 16px;
          opacity: 0; animation: csfu 0.8s ease 0.1s forwards;
        }
        .cs-hero-title em { font-style: italic; color: var(--gold); }
        .cs-hero-sub {
          font-size: 16px; line-height: 1.65;
          color: rgba(255,255,255,0.8);
          max-width: 560px;
          opacity: 0; animation: csfu 0.8s ease 0.2s forwards;
        }

        /* ── SECTION BASE ── */
        .cs-section {
          padding: 64px 40px;
          border-bottom: 1px solid var(--border);
          opacity: 0; animation: csfu 0.8s ease forwards;
        }
        @media(max-width:680px) { .cs-section { padding: 48px 24px; } }
        .cs-inner { max-width: 960px; margin: 0 auto; }

        .cs-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px; letter-spacing: 0.28em;
          text-transform: uppercase; color: var(--green-mid);
          margin-bottom: 32px;
          display: flex; align-items: center; gap: 14px;
        }
        .cs-label::after {
          content: ''; flex: 1; height: 1px;
          background: var(--border); max-width: 100px;
        }

        /* ── WHAT + HISTORY (top, near hero) ── */
        .cs-intro-grid {
          display: grid;
          grid-template-columns: 3fr 2fr;
          gap: 56px; align-items: start;
        }
        @media(max-width:680px) { .cs-intro-grid { grid-template-columns: 1fr; gap: 40px; } }

        .cs-intro-lede {
          font-family: 'Playfair Display', serif;
          font-size: clamp(22px, 3vw, 28px);
          font-weight: 700; line-height: 1.5; color: var(--ink);
          margin-bottom: 20px;
        }
        .cs-intro-lede em { font-style: italic; color: var(--green-mid); }
        .cs-intro-body {
          font-size: 15px; line-height: 1.75; color: var(--muted);
          margin-bottom: 16px;
        }
        .cs-intro-body strong { color: var(--green-deep); font-weight: 600; }

        /* history sidebar */
        .cs-history-aside {
          background: var(--green-deep);
          padding: 28px; color: var(--white);
        }
        .aside-year {
          font-family: 'Playfair Display', serif;
          font-size: 52px; font-weight: 900;
          color: var(--gold); line-height: 1; margin-bottom: 4px;
        }
        .aside-place {
          font-size: 10px; letter-spacing: 0.2em;
          text-transform: uppercase; color: rgba(255,255,255,0.5);
          margin-bottom: 20px; padding-bottom: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .aside-facts { list-style: none; }
        .aside-facts li {
          font-size: 12px; line-height: 1.6;
          color: rgba(255,255,255,0.7);
          padding: 7px 0; border-bottom: 1px solid rgba(255,255,255,0.08);
          display: flex; gap: 10px;
        }
        .aside-facts li:last-child { border-bottom: none; }
        .aside-facts li::before { content: '—'; color: var(--gold); flex-shrink: 0; }

        /* ── PILLARS ── */
        .cs-pillars {
          display: grid; grid-template-columns: repeat(4, 1fr);
          border: 1px solid var(--border);
        }
        @media(max-width:680px) { .cs-pillars { grid-template-columns: 1fr 1fr; } }

        .cs-pillar {
          padding: 28px 24px;
          border-right: 1px solid var(--border);
          transition: background 0.2s;
        }
        .cs-pillar:last-child { border-right: none; }
        @media(max-width:680px) {
          .cs-pillar:nth-child(2) { border-right: none; }
          .cs-pillar:nth-child(1), .cs-pillar:nth-child(2) { border-bottom: 1px solid var(--border); }
        }
        .cs-pillar:hover { background: var(--green-pale); }
        .cs-pillar-num { font-family: 'DM Mono',monospace; font-size: 10px; letter-spacing: 0.2em; color: var(--gold); margin-bottom: 14px; }
        .cs-pillar-title { font-family: 'Playfair Display',serif; font-size: 22px; font-weight: 700; color: var(--ink); margin-bottom: 10px; }
        .cs-pillar-body { font-size: 13px; line-height: 1.75; color: var(--muted); }

        /* ── SEEDING / WHERE WE ARE ── */
        .cs-seeding-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 48px;
        }
        @media(max-width:680px) { .cs-seeding-grid { grid-template-columns: 1fr; gap: 32px; } }

        .cs-seeding-intro {
          font-family: 'Playfair Display', serif;
          font-size: clamp(17px, 2vw, 20px);
          font-weight: 700; line-height: 1.7; color: var(--ink);
        }
        .cs-seeding-intro strong { color: var(--green-deep); }

        .cs-timeline { list-style: none; }
        .cs-timeline li {
          display: flex; gap: 16px;
          padding: 14px 0; border-bottom: 1px solid var(--border);
        }
        .cs-timeline li:last-child { border-bottom: none; }
        .tl-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--gold); margin-top: 6px; flex-shrink: 0; }
        .tl-text { font-size: 13px; line-height: 1.65; color: var(--muted); }
        .tl-text strong { color: var(--ink); font-weight: 600; }

        /* ── FEATURES ── */
        .cs-feat-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          border: 1px solid var(--border);
        }
        @media(max-width:680px) { .cs-feat-grid { grid-template-columns: 1fr 1fr; } }
        @media(max-width:440px) { .cs-feat-grid { grid-template-columns: 1fr; } }

        .cs-feat {
          padding: 24px; border-right: 1px solid var(--border);
          border-bottom: 1px solid var(--border); transition: background 0.2s;
        }
        .cs-feat:nth-child(3n) { border-right: none; }
        .cs-feat:nth-last-child(-n+3) { border-bottom: none; }
        @media(max-width:680px) {
          .cs-feat:nth-child(3n) { border-right: 1px solid var(--border); }
          .cs-feat:nth-child(2n) { border-right: none; }
          .cs-feat:nth-last-child(-n+3) { border-bottom: 1px solid var(--border); }
          .cs-feat:nth-last-child(-n+2) { border-bottom: none; }
        }
        .cs-feat:hover { background: var(--green-pale); }
        .cs-feat-tag { font-family: 'DM Mono',monospace; font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--green-mid); margin-bottom: 12px; display: block; }
        .cs-feat-title { font-family: 'Playfair Display',serif; font-size: 18px; font-weight: 700; color: var(--ink); margin-bottom: 8px; }
        .cs-feat-desc { font-size: 13px; line-height: 1.75; color: var(--muted); }

        /* ── PREVIEW CTA ── */
        .cs-preview-bar {
          background: var(--green-deep);
          padding: 40px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 24px; flex-wrap: wrap;
        }
        .cs-preview-bar h3 {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 900; color: var(--white);
          margin-bottom: 6px;
        }
        .cs-preview-bar p { font-size: 13px; color: rgba(255,255,255,0.6); max-width: 480px; line-height: 1.6; }
        .cs-preview-btn {
          background: var(--gold); color: var(--green-deep);
          padding: 12px 24px; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700;
          white-space: nowrap; border-radius: 6px;
          text-decoration: none; display: inline-block;
          transition: background 0.2s;
        }
        .cs-preview-btn:hover { background: #dbb95a; }

        /* ── REGISTRATION ── */
        .cs-reg { padding: 64px 40px 80px; background: var(--white); }
        @media(max-width:680px) { .cs-reg { padding: 48px 24px 64px; } }
        .cs-reg-inner {
          max-width: 960px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: start;
        }
        @media(max-width:680px) { .cs-reg-inner { grid-template-columns: 1fr; gap: 40px; } }

        .cs-reg-copy h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 4vw, 44px); font-weight: 900;
          line-height: 1.1; color: var(--ink); margin-bottom: 14px;
        }
        .cs-reg-copy h2 em { font-style: italic; color: var(--green-mid); }
        .cs-reg-copy p { font-size: 14px; line-height: 1.75; color: var(--muted); margin-bottom: 20px; }

        /* ── PRICING (moved to bottom) ── */
        .cs-pricing-section {
          padding: 64px 40px;
          background: var(--cream);
          border-top: 1px solid var(--border);
        }
        @media(max-width:680px) { .cs-pricing-section { padding: 48px 24px; } }

        .cs-pricing {
          display: grid; grid-template-columns: 1fr 1fr; gap: 2px;
          max-width: 960px; margin: 0 auto;
        }
        @media(max-width:680px) { .cs-pricing { grid-template-columns: 1fr; } }

        .cs-price-card { padding: 36px; border: 1px solid var(--border); }
        .cs-price-card.free-card { background: var(--white); }
        .cs-price-card.paid-card { background: var(--green-deep); color: var(--white); }

        .price-tier { font-family: 'DM Mono',monospace; font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 10px; }
        .free-card .price-tier { color: var(--green-mid); }
        .paid-card .price-tier { color: var(--gold); }

        .price-amount { font-family: 'Playfair Display',serif; font-size: 48px; font-weight: 900; line-height: 1; margin-bottom: 4px; }
        .free-card .price-amount { color: var(--ink); }
        .paid-card .price-amount { color: var(--white); }

        .price-period { font-size: 13px; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid var(--border); }
        .paid-card .price-period { border-color: rgba(255,255,255,0.15); color: rgba(255,255,255,0.6); }
        .free-card .price-period { color: var(--muted); }

        .price-features { list-style: none; }
        .price-features li { font-size: 14px; line-height: 1.6; padding: 8px 0; border-bottom: 1px solid var(--border); display: flex; gap: 12px; }
        .paid-card .price-features li { border-color: rgba(255,255,255,0.1); color: rgba(255,255,255,0.85); }
        .free-card .price-features li { color: var(--muted); }
        .price-features li:last-child { border-bottom: none; }
        .price-features li::before { content: '✓'; flex-shrink: 0; }
        .free-card .price-features li::before { color: var(--green-mid); }
        .paid-card .price-features li::before { color: var(--gold); }

        .price-note { margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border); font-size: 12px; line-height: 1.6; }
        .paid-card .price-note { border-color: rgba(255,255,255,0.15); color: rgba(255,255,255,0.5); }
        .free-card .price-note { color: var(--muted); }

        /* ── FORM ── */
        .cs-tabs {
          display: flex; border: 1px solid var(--border);
          margin-bottom: 20px; border-radius: 6px; overflow: hidden;
        }
        .cs-tab {
          flex: 1; padding: 11px 8px;
          background: transparent; border: none; border-right: 1px solid var(--border);
          color: var(--muted); font-family: 'DM Sans', sans-serif;
          font-size: 11px; font-weight: 500; cursor: pointer;
          transition: all 0.18s; text-align: center;
        }
        .cs-tab:last-child { border-right: none; }
        .cs-tab.active { background: var(--green-deep); color: var(--white); }
        .cs-tab:not(.active):hover { background: var(--green-pale); color: var(--ink); }

        .cs-field { margin-bottom: 2px; }
        .cs-input {
          width: 100%; padding: 13px 16px;
          background: var(--cream); border: 1px solid var(--border);
          color: var(--ink); font-family: 'DM Sans', sans-serif;
          font-size: 14px; outline: none;
          transition: border-color 0.18s; border-radius: 4px;
        }
        .cs-input::placeholder { color: #b0a898; }
        .cs-input:focus { border-color: var(--green-mid); background: var(--white); }

        .cs-suggest-hint {
          background: var(--green-pale); border: 1px solid #b8e0c4;
          padding: 14px 16px; font-size: 13px; line-height: 1.65;
          color: var(--green-deep); margin-bottom: 2px; border-radius: 4px;
        }
        .cs-suggest-hint strong { font-weight: 600; }

        .cs-sbtn {
          width: 100%; margin-top: 2px; padding: 14px;
          background: var(--green-deep); border: none; color: var(--white);
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
          letter-spacing: 0.04em; cursor: pointer;
          transition: background 0.18s; border-radius: 4px;
        }
        .cs-sbtn:hover { background: var(--green-mid); }
        .cs-sbtn:disabled { opacity: 0.4; cursor: not-allowed; }

        .cs-fnote { margin-top: 12px; font-size: 11px; color: var(--muted); line-height: 1.65; }
        .cs-err { margin-top: 10px; font-size: 12px; color: #8B2020; }

        .cs-success {
          border: 1px solid var(--green-light); background: var(--green-pale);
          padding: 32px; text-align: center; border-radius: 6px;
        }
        .cs-success-title { font-family: 'Playfair Display',serif; font-size: 28px; font-weight: 700; color: var(--green-deep); margin-bottom: 10px; }
        .cs-success-body { font-size: 13px; color: var(--green-mid); line-height: 1.7; }

        /* ── FOOTER ── */
        .cs-footer {
          background: var(--green-deep); padding: 28px 40px;
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 12px;
        }
        .cs-footer-brand { font-family: 'Playfair Display',serif; font-size: 17px; font-weight: 900; color: var(--white); }
        .cs-footer-brand span { color: var(--gold); }
        .cs-footer-copy { font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.08em; }

        @keyframes csfu { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* ── HEADER ── */}
      <header className="cs-header">
        <div className="cs-logo">
          <div className="cs-logo-icon">🏛</div>
          <span className="cs-logo-text">District <span>1921</span></span>
        </div>
        <span className="cs-badge">Pre-Launch · Q3 2025</span>
      </header>

      {/* ── HERO — full bleed photo ── */}
      <div className="cs-hero">
        <Image
          src="/hero-district.png"
          alt="District 1921 — Historic Neighborhood"
          fill
          priority
          className="cs-hero-img"
          style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
        />
        <div className="cs-hero-overlay" />
        <div className="cs-hero-content">
          <p className="cs-hero-eyebrow">District 1921 · All 50 States</p>
          <h1 className="cs-hero-title">
            The community<br />
            business directory<br />
            <em>built for us.</em>
          </h1>
          <p className="cs-hero-sub">
            A nationwide directory where community members discover, share, and support businesses — and owners build a real presence. <strong style={{color:'var(--gold)'}}>Free to search. Free to list.</strong>
          </p>
        </div>
      </div>

      {/* ── WHAT WE'RE BUILDING + THE NAME (near top) ── */}
      <div className="cs-section" style={{ animationDelay: '0.05s' }}>
        <div className="cs-inner">
          <p className="cs-label">Our Mission</p>
          <div className="cs-intro-grid">
            <div>
              <p className="cs-intro-lede">
                On May 31, 1921, <em>Black Wall Street</em> was burned to the ground. We carry that name forward — not as a monument, but as a foundation.
              </p>
              <p className="cs-intro-body">
                The <strong>Greenwood District of Tulsa, Oklahoma</strong> was one of the wealthiest Black communities in American history. Over 35 blocks of thriving businesses, homes, hospitals, and schools were destroyed in 18 hours. Built from nothing. Gone overnight.
              </p>
              <p className="cs-intro-body">
                District 1921 is the directory that should have always existed — a place where every community business is findable, shareable, and supported. <strong>The community will know what this name means. Everyone else will get curious.</strong>
              </p>
            </div>
            <div className="cs-history-aside">
              <div className="aside-year">1921</div>
              <div className="aside-place">Greenwood District, Tulsa</div>
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

      {/* ── WHAT WE'RE BUILDING — pillars ── */}
      <div className="cs-section" style={{ animationDelay: '0.1s' }}>
        <div className="cs-inner">
          <p className="cs-label">What We're Building</p>
          <div className="cs-pillars">
            <div className="cs-pillar">
              <p className="cs-pillar-num">01</p>
              <p className="cs-pillar-title">Discovery</p>
              <p className="cs-pillar-body">Search and find community businesses across every city in all 50 states. Map-first, mobile-first, community-driven.</p>
            </div>
            <div className="cs-pillar">
              <p className="cs-pillar-num">02</p>
              <p className="cs-pillar-title">Trust</p>
              <p className="cs-pillar-body">The Gold Shield — earned through real verification. SOS lookup, phone check, web reachability, and a proof photo.</p>
            </div>
            <div className="cs-pillar">
              <p className="cs-pillar-num">03</p>
              <p className="cs-pillar-title">Community</p>
              <p className="cs-pillar-body">Check-ins, follows, deals, events, jobs, and a request board connecting community needs to verified businesses.</p>
            </div>
            <div className="cs-pillar">
              <p className="cs-pillar-num">04</p>
              <p className="cs-pillar-title">Ownership</p>
              <p className="cs-pillar-body">$15/month flat. Full profile, analytics, leads. No upsells, no ad dependency. Professional presence. Yours to own.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── WHERE WE ARE NOW ── */}
      <div className="cs-section" style={{ animationDelay: '0.15s' }}>
        <div className="cs-inner">
          <p className="cs-label">Where We Are Now</p>
          <div className="cs-seeding-grid">
            <div className="cs-seeding-intro">
              We are actively pre-seeding the directory — researching and adding community businesses across the country so the platform has <strong>real depth from day one.</strong> We want you to see your city already populated when the doors open.
            </div>
            <ul className="cs-timeline">
              <li><div className="tl-dot" /><div className="tl-text"><strong>Now</strong> — Pre-registration open. Join the waitlist, register your business, or suggest one you want to see listed.</div></li>
              <li><div className="tl-dot" /><div className="tl-text"><strong>Before launch</strong> — Owners of seeded businesses are contacted and invited to claim their listing.</div></li>
              <li><div className="tl-dot" /><div className="tl-text"><strong>Q3 2025</strong> — Full platform live. Search, map, Gold Shield, profiles, deals, events, jobs.</div></li>
              <li><div className="tl-dot" /><div className="tl-text"><strong>Early owners</strong> — Registered owners get 3 months free when paid pages launch.</div></li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── COMING FEATURES ── */}
      <div className="cs-section" style={{ animationDelay: '0.2s' }}>
        <div className="cs-inner">
          <p className="cs-label">Coming to the Platform</p>
          <div className="cs-feat-grid">
            <div className="cs-feat"><span className="cs-feat-tag">Deals</span><p className="cs-feat-title">Community Deals</p><p className="cs-feat-desc">Owners post exclusive offers. Followers get notified first. Browse deals across every category and city.</p></div>
            <div className="cs-feat"><span className="cs-feat-tag">Events</span><p className="cs-feat-title">Local Events</p><p className="cs-feat-desc">Grand openings, pop-ups, gatherings. Discover what's happening near you, searchable by city.</p></div>
            <div className="cs-feat"><span className="cs-feat-tag">Jobs</span><p className="cs-feat-title">Job Board</p><p className="cs-feat-desc">Community businesses hiring community members. 30-day listings, direct applications, no middleman.</p></div>
            <div className="cs-feat"><span className="cs-feat-tag">Requests</span><p className="cs-feat-title">Request Board</p><p className="cs-feat-desc">"I need a plumber in Atlanta." Post a need, get matched to verified local businesses.</p></div>
            <div className="cs-feat"><span className="cs-feat-tag">Verification</span><p className="cs-feat-title">Gold Shield</p><p className="cs-feat-desc">SOS lookup, phone check, web reachability, and a proof photo. Earned — not purchased.</p></div>
            <div className="cs-feat"><span className="cs-feat-tag">Map</span><p className="cs-feat-title">Near Me</p><p className="cs-feat-desc">Clustered pins, open-now filters, mobile service flags. Find community businesses wherever you are.</p></div>
          </div>
        </div>
      </div>

      {/* ── PLATFORM PREVIEW LINK ── */}
      <div className="cs-preview-bar">
        <div>
          <h3>See what the platform looks like</h3>
          <p>We've built a concept showing search results, map view, a full business profile, and the Gold Shield badge — exactly what you'll see at launch.</p>
        </div>
        <a href="/preview" className="cs-preview-btn" target="_blank" rel="noopener noreferrer">
          View Platform Preview →
        </a>
      </div>

      {/* ── REGISTRATION ── */}
      <div className="cs-reg">
        <div className="cs-reg-inner">
          <div className="cs-reg-copy">
            <p className="cs-label">Get Involved</p>
            <h2>Be first<br /><em>through the doors.</em></h2>
            <p>Join the waitlist, register your business, or nominate one you love — we'll make sure it's in the directory on launch day.</p>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>Every business submitted gets researched and added to our seed data. The owner is contacted before we go live. Early registered owners get 3 months free.</p>
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

      {/* ── PRICING — moved to bottom ── */}
      <div className="cs-pricing-section" id="pricing">
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <p className="cs-label">How It Works</p>
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
              <p className="price-amount">$15<span style={{ fontSize: '20px', fontWeight: 400 }}>/mo</span></p>
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

      {/* ── FOOTER ── */}
      <footer className="cs-footer">
        <span className="cs-footer-brand">District <span>1921</span></span>
        <span className="cs-footer-copy">© 2025 · All 50 States · Built for the community</span>
      </footer>
    </div>
  )
}
