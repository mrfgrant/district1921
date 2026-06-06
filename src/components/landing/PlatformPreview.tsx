'use client'
import { useState } from 'react'
import Link from 'next/link'

type View = 'search' | 'profile'

export function PlatformPreview() {
  const [view, setView] = useState<View>('search')
  const [activeFilter, setActiveFilter] = useState('All')

  return (
    <div className="pv">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --gd: #1a3a2a; --gm: #2d6a4f; --gl: #40916c; --gp: #d8f3dc;
          --gold: #c9a84c; --gold-lt: #f5e6c0;
          --cream: #faf7f0; --ink: #1c1c1c; --muted: #6b7280;
          --border: #e5e0d5; --white: #ffffff; --ad-bg: #f9f5ee;
        }
        .pv { min-height: 100vh; background: var(--cream); font-family: 'DM Sans', sans-serif; color: var(--ink); }

        /* ── TOP BAR ── */
        .pv-topbar {
          background: var(--gd); height: 56px; padding: 0 24px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 16px rgba(0,0,0,0.3);
        }
        .pv-logo { display: flex; align-items: center; gap: 9px; text-decoration: none; }
        .pv-logo-icon { width: 30px; height: 30px; background: var(--gold); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 14px; }
        .pv-logo-text { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 900; color: white; }
        .pv-logo-text span { color: var(--gold); }
        .pv-topnav { display: flex; align-items: center; gap: 20px; }
        .pv-topnav a { color: rgba(255,255,255,0.7); text-decoration: none; font-size: 13px; font-weight: 500; transition: color 0.2s; }
        .pv-topnav a:hover { color: var(--gold); }
        .pv-topnav .nav-cta { background: var(--gold); color: var(--gd) !important; padding: 7px 14px; border-radius: 5px; font-weight: 600 !important; }

        /* ── PREVIEW BANNER ── */
        .pv-banner {
          background: var(--gold-lt); border-bottom: 1px solid #e8d090;
          padding: 10px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;
        }
        .pv-banner p { font-size: 13px; color: #5a4010; line-height: 1.4; }
        .pv-banner strong { color: #3a2a08; }
        .pv-back { font-size: 12px; font-weight: 600; color: var(--gm); text-decoration: none; white-space: nowrap; }
        .pv-back:hover { color: var(--gd); }

        /* ── VIEW TABS ── */
        .pv-tabs {
          background: white; border-bottom: 1px solid var(--border);
          padding: 0 24px; display: flex; gap: 0;
        }
        .pv-tab {
          padding: 14px 20px; font-size: 13px; font-weight: 500;
          border: none; background: transparent; cursor: pointer;
          color: var(--muted); border-bottom: 2px solid transparent;
          transition: all 0.18s;
        }
        .pv-tab.active { color: var(--gd); border-bottom-color: var(--gold); font-weight: 600; }
        .pv-tab:hover:not(.active) { color: var(--ink); }

        /* ── SEARCH HERO ── */
        .pv-hero {
          background: linear-gradient(135deg, var(--gd) 0%, var(--gm) 60%, #1a4a35 100%);
          padding: 32px 24px;
          position: relative; overflow: hidden;
        }
        .pv-hero::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(circle at 20% 50%, rgba(201,168,76,0.08) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(64,145,108,0.12) 0%, transparent 40%);
        }
        .pv-hero-label { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase; color: var(--gold); margin-bottom: 10px; position: relative; }
        .pv-hero h1 { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 900; color: white; line-height: 1.1; margin-bottom: 6px; position: relative; }
        .pv-hero p { color: rgba(255,255,255,0.65); font-size: 14px; margin-bottom: 20px; position: relative; }

        .pv-search-bar {
          display: flex; max-width: 640px;
          background: white; border-radius: 10px; overflow: hidden;
          box-shadow: 0 6px 32px rgba(0,0,0,0.22); position: relative;
        }
        .pv-search-field { flex: 1; display: flex; align-items: center; padding: 0 14px; gap: 8px; border-right: 1px solid var(--border); }
        .pv-search-field input { flex: 1; border: none; outline: none; font-family: 'DM Sans', sans-serif; font-size: 14px; padding: 14px 0; color: var(--ink); background: transparent; }
        .pv-search-field input::placeholder { color: var(--muted); }
        .pv-loc-field { display: flex; align-items: center; padding: 0 14px; gap: 6px; min-width: 160px; }
        .pv-loc-field input { border: none; outline: none; font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 14px 0; width: 120px; color: var(--ink); background: transparent; }
        .pv-search-btn { background: var(--gold); border: none; padding: 0 24px; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 13px; color: var(--gd); cursor: pointer; }

        .pv-pills { display: flex; gap: 7px; flex-wrap: wrap; margin-top: 16px; position: relative; }
        .pv-pill {
          background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.85); padding: 5px 12px; border-radius: 20px;
          font-size: 11px; font-weight: 500; cursor: pointer; transition: all 0.18s;
        }
        .pv-pill:hover, .pv-pill.active { background: var(--gold); border-color: var(--gold); color: var(--gd); }

        /* ── MAIN LAYOUT ── */
        .pv-main { display: grid; grid-template-columns: 1fr 260px; max-width: 1200px; margin: 0 auto; padding: 20px 16px; gap: 0; align-items: start; }
        @media(max-width:860px) { .pv-main { grid-template-columns: 1fr; } .pv-ad-col { display: none; } }

        .pv-content { padding-right: 20px; }

        /* result bar */
        .pv-result-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .pv-count { font-size: 13px; color: var(--muted); }
        .pv-count strong { color: var(--ink); }
        .pv-view-btns { display: flex; background: white; border: 1px solid var(--border); border-radius: 7px; overflow: hidden; }
        .pv-vbtn { padding: 6px 12px; font-size: 11px; font-weight: 500; border: none; background: transparent; cursor: pointer; color: var(--muted); display: flex; align-items: center; gap: 4px; transition: all 0.15s; }
        .pv-vbtn.active { background: var(--gd); color: white; }

        /* ── MAP ── */
        .pv-map {
          background: #e8f4eb; border-radius: 12px; height: 240px;
          margin-bottom: 16px; position: relative; overflow: hidden;
          border: 1px solid var(--border);
        }
        .pv-map-grid {
          position: absolute; inset: 0;
          background: linear-gradient(rgba(180,220,195,0.4) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(180,220,195,0.4) 1px, transparent 1px);
          background-size: 28px 28px;
        }
        /* streets */
        .pv-map-street-h {
          position: absolute; left: 0; right: 0; height: 2px; background: rgba(255,255,255,0.7);
        }
        .pv-map-street-v {
          position: absolute; top: 0; bottom: 0; width: 2px; background: rgba(255,255,255,0.7);
        }
        .pv-map-pin { position: absolute; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translateX(-50%); }
        .pv-pin-dot { width: 26px; height: 26px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 2px 8px rgba(0,0,0,0.25); }
        .pv-pin-dot.gold { background: var(--gold); }
        .pv-pin-dot.green { background: var(--gm); }
        .pv-pin-label { background: white; padding: 2px 7px; border-radius: 4px; font-size: 9px; font-weight: 700; color: var(--ink); white-space: nowrap; box-shadow: 0 1px 4px rgba(0,0,0,0.15); margin-top: 3px; }
        .pv-map-legend { position: absolute; bottom: 10px; left: 10px; background: white; border-radius: 7px; padding: 7px 10px; display: flex; gap: 10px; font-size: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .pv-legend-item { display: flex; align-items: center; gap: 4px; color: var(--muted); font-weight: 500; }
        .pv-legend-dot { width: 9px; height: 9px; border-radius: 50%; }
        .pv-map-ctrl { position: absolute; top: 10px; right: 10px; display: flex; flex-direction: column; gap: 3px; }
        .pv-ctrl-btn { width: 30px; height: 30px; background: white; border: 1px solid var(--border); border-radius: 5px; display: flex; align-items: center; justify-content: center; font-size: 13px; cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }

        /* filter chips */
        .pv-filters { display: flex; gap: 7px; margin-bottom: 14px; overflow-x: auto; padding-bottom: 3px; }
        .pv-chip { background: white; border: 1px solid var(--border); border-radius: 20px; padding: 4px 11px; font-size: 11px; font-weight: 500; color: var(--muted); cursor: pointer; white-space: nowrap; transition: all 0.15s; }
        .pv-chip.active { background: var(--gd); border-color: var(--gd); color: white; }

        /* ── LISTING CARDS ── */
        .pv-listings { display: flex; flex-direction: column; gap: 12px; }

        .pv-card {
          background: white; border: 1px solid var(--border); border-radius: 12px;
          padding: 16px; display: grid; grid-template-columns: 60px 1fr auto;
          gap: 14px; align-items: start; cursor: pointer; position: relative;
          transition: box-shadow 0.18s, border-color 0.18s;
        }
        .pv-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); border-color: var(--gl); }
        .pv-card.featured { border-color: var(--gold); background: linear-gradient(135deg, #fffdf5 0%, white 100%); }

        .pv-feat-badge {
          position: absolute; top: -1px; right: 18px;
          background: var(--gold); color: var(--gd);
          font-size: 9px; font-weight: 700; padding: 2px 9px;
          border-radius: 0 0 5px 5px; letter-spacing: 0.5px; text-transform: uppercase;
        }
        .pv-logo-box {
          width: 60px; height: 60px; border-radius: 9px;
          background: var(--gp); display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700;
          color: var(--gm); flex-shrink: 0;
        }
        .pv-biz-name { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: var(--ink); margin-bottom: 2px; display: flex; align-items: center; gap: 6px; }
        .pv-shield { width: 15px; height: 15px; background: var(--gold); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 8px; color: white; flex-shrink: 0; }
        .pv-biz-cat { font-size: 10px; color: var(--gm); font-weight: 600; letter-spacing: 0.4px; text-transform: uppercase; margin-bottom: 4px; }
        .pv-biz-meta { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--muted); margin-bottom: 5px; flex-wrap: wrap; }
        .pv-stars { color: var(--gold); font-size: 11px; letter-spacing: 1px; }
        .pv-open { font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 3px; }
        .pv-open.o { background: #e8f5e9; color: #2e7d32; }
        .pv-open.c { background: #fdecea; color: #c62828; }
        .pv-biz-desc { font-size: 12px; color: var(--muted); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .pv-card-actions { display: flex; flex-direction: column; gap: 5px; align-items: flex-end; min-width: 72px; }
        .pv-act-btn { display: flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 600; padding: 4px 9px; border-radius: 5px; border: 1px solid var(--border); cursor: pointer; background: white; color: var(--muted); white-space: nowrap; }
        .pv-act-btn.g { color: var(--gm); border-color: var(--gm); }
        .pv-act-btn.gold { color: #9a7030; border-color: var(--gold); }

        /* free card label */
        .pv-free-tag { font-size: 9px; color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase; margin-top: 4px; }

        /* ── AD COLUMN ── */
        .pv-ad-col { position: sticky; top: 72px; display: flex; flex-direction: column; gap: 14px; }
        .pv-ad-unit { background: var(--ad-bg); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
        .pv-ad-label { font-size: 8px; font-weight: 700; letter-spacing: 1.5px; color: var(--muted); text-transform: uppercase; text-align: right; padding: 5px 9px 0; }
        .pv-ad-body { padding: 12px; }
        .pv-ad-img { width: 100%; height: 100px; border-radius: 7px; background: linear-gradient(135deg, var(--gm), var(--gd)); display: flex; align-items: center; justify-content: center; color: white; font-family: 'Playfair Display', serif; font-size: 13px; font-weight: 700; margin-bottom: 8px; text-align: center; padding: 10px; }
        .pv-ad-title { font-size: 12px; font-weight: 600; color: var(--ink); margin-bottom: 3px; }
        .pv-ad-sub { font-size: 10px; color: var(--muted); margin-bottom: 8px; line-height: 1.4; }
        .pv-ad-cta { display: block; background: var(--gd); color: white; text-align: center; padding: 7px; border-radius: 5px; font-size: 11px; font-weight: 600; cursor: pointer; }
        .pv-promote { background: linear-gradient(135deg, var(--gd), var(--gm)); border-radius: 10px; padding: 16px; color: white; text-align: center; }
        .pv-promote h4 { font-family: 'Playfair Display', serif; font-size: 14px; margin-bottom: 5px; }
        .pv-promote p { font-size: 11px; opacity: 0.75; margin-bottom: 10px; line-height: 1.4; }
        .pv-promote-btn { background: var(--gold); color: var(--gd); padding: 8px 14px; border-radius: 5px; font-size: 11px; font-weight: 700; display: block; cursor: pointer; }

        /* ── BUSINESS PROFILE VIEW ── */
        .pv-profile { max-width: 960px; margin: 0 auto; padding: 24px 16px; }

        /* cover photo */
        .pv-cover {
          height: 240px; border-radius: 14px; overflow: hidden; position: relative; margin-bottom: -48px;
          background: linear-gradient(135deg, #1a3a2a 0%, #2d6a4f 60%, #1a4a35 100%);
        }
        .pv-cover-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.35) 100%); }
        .pv-cover-label { position: absolute; bottom: 16px; right: 16px; display: flex; gap: 8px; }
        .pv-cover-tag { background: rgba(0,0,0,0.5); color: white; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; }

        /* profile header */
        .pv-prof-header { background: white; border-radius: 14px; padding: 20px 24px 20px 20px; border: 1px solid var(--border); display: grid; grid-template-columns: 88px 1fr auto; gap: 16px; align-items: start; margin-bottom: 20px; }
        .pv-prof-logo { width: 88px; height: 88px; border-radius: 12px; background: var(--gp); display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: var(--gm); border: 3px solid white; box-shadow: 0 2px 12px rgba(0,0,0,0.12); flex-shrink: 0; }
        .pv-prof-name { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 900; color: var(--ink); margin-bottom: 4px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .pv-shield-badge { background: var(--gold); color: var(--gd); padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; letter-spacing: 0.3px; display: inline-flex; align-items: center; gap: 4px; }
        .pv-prof-cat { font-size: 12px; color: var(--gm); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .pv-prof-meta { display: flex; align-items: center; gap: 12px; font-size: 13px; color: var(--muted); flex-wrap: wrap; }
        .pv-prof-actions { display: flex; flex-direction: column; gap: 8px; min-width: 120px; }
        .pv-prof-btn { padding: 9px 16px; border-radius: 7px; font-size: 12px; font-weight: 600; cursor: pointer; text-align: center; border: none; transition: all 0.18s; }
        .pv-prof-btn.primary { background: var(--gd); color: white; }
        .pv-prof-btn.primary:hover { background: var(--gm); }
        .pv-prof-btn.outline { background: white; color: var(--gm); border: 1px solid var(--gm); }
        .pv-prof-btn.gold-btn { background: var(--gold-lt); color: #7a5010; border: 1px solid var(--gold); }

        /* stats row */
        .pv-stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; margin-bottom: 20px; }
        .pv-stat-box { background: white; border: 1px solid var(--border); padding: 16px; text-align: center; }
        .pv-stat-num { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: var(--gd); line-height: 1; margin-bottom: 4px; }
        .pv-stat-label { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); }

        /* profile body grid */
        .pv-prof-body { display: grid; grid-template-columns: 1fr 300px; gap: 20px; }
        @media(max-width:720px) { .pv-prof-body { grid-template-columns: 1fr; } .pv-prof-header { grid-template-columns: 72px 1fr; } .pv-prof-actions { grid-column: 1 / -1; flex-direction: row; } }

        .pv-section-card { background: white; border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-bottom: 16px; }
        .pv-section-title { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: var(--ink); margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
        .pv-section-title span { font-size: 11px; font-weight: 500; color: var(--gm); cursor: pointer; font-family: 'DM Sans', sans-serif; }

        /* description */
        .pv-desc { font-size: 14px; line-height: 1.75; color: var(--muted); }

        /* hours */
        .pv-hours { list-style: none; }
        .pv-hours li { display: flex; justify-content: space-between; font-size: 13px; padding: 6px 0; border-bottom: 1px solid var(--border); color: var(--muted); }
        .pv-hours li:last-child { border-bottom: none; }
        .pv-hours li strong { color: var(--ink); }
        .pv-hours li.today { color: var(--ink); font-weight: 500; }

        /* deals */
        .pv-deals { display: flex; flex-direction: column; gap: 10px; }
        .pv-deal { background: var(--gold-lt); border: 1px solid #e8d080; border-radius: 8px; padding: 12px 14px; display: flex; align-items: center; gap: 12px; }
        .pv-deal-icon { font-size: 20px; }
        .pv-deal-title { font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 2px; }
        .pv-deal-desc { font-size: 11px; color: #7a5820; }

        /* contact card */
        .pv-contact-row { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--ink); padding: 8px 0; border-bottom: 1px solid var(--border); }
        .pv-contact-row:last-child { border-bottom: none; }
        .pv-contact-icon { width: 32px; height: 32px; background: var(--gp); border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
        .pv-contact-label { font-size: 10px; color: var(--muted); margin-bottom: 1px; text-transform: uppercase; letter-spacing: 0.1em; }
        .pv-contact-val { font-size: 13px; color: var(--ink); font-weight: 500; }

        /* shield verification card */
        .pv-shield-card { background: linear-gradient(135deg, #fffbf0, #fff8e6); border: 1px solid var(--gold); border-radius: 10px; padding: 16px; margin-bottom: 14px; }
        .pv-shield-title { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; color: var(--gd); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
        .pv-shield-checks { display: flex; flex-direction: column; gap: 7px; }
        .pv-shield-check { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--ink); }
        .pv-check-icon { width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; flex-shrink: 0; }
        .pv-check-icon.pass { background: #e8f5e9; color: #2e7d32; }

        /* reviews */
        .pv-rating-big { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; padding-bottom: 14px; border-bottom: 1px solid var(--border); }
        .pv-rating-num { font-family: 'Playfair Display', serif; font-size: 48px; font-weight: 700; color: var(--ink); line-height: 1; }
        .pv-rating-stars { font-size: 20px; color: var(--gold); letter-spacing: 2px; margin-bottom: 4px; }
        .pv-rating-sub { font-size: 12px; color: var(--muted); }
        .pv-checkin-banner { background: var(--gp); border-radius: 8px; padding: 12px 14px; text-align: center; font-size: 13px; color: var(--gd); font-weight: 500; }
        .pv-checkin-banner strong { font-size: 16px; }

        /* photos strip */
        .pv-photos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
        .pv-photo { border-radius: 8px; height: 80px; }
        .pv-photo:nth-child(1) { background: linear-gradient(135deg, #2d6a4f, #1a3a2a); }
        .pv-photo:nth-child(2) { background: linear-gradient(135deg, #40916c, #2d6a4f); }
        .pv-photo:nth-child(3) { background: linear-gradient(135deg, #c9a84c, #9a7030); }

        /* ── BOTTOM BANNER ── */
        .pv-cta-banner {
          background: var(--gd); padding: 40px 24px; text-align: center; margin-top: 32px;
        }
        .pv-cta-banner h3 { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 900; color: white; margin-bottom: 10px; }
        .pv-cta-banner p { font-size: 14px; color: rgba(255,255,255,0.65); margin-bottom: 20px; line-height: 1.6; max-width: 500px; margin-left: auto; margin-right: auto; }
        .pv-cta-btns { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
        .pv-cta-btn { padding: 12px 24px; border-radius: 7px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all 0.18s; text-decoration: none; }
        .pv-cta-btn.primary { background: var(--gold); color: var(--gd); }
        .pv-cta-btn.primary:hover { background: #dbb94e; }
        .pv-cta-btn.outline { background: transparent; color: white; border: 1px solid rgba(255,255,255,0.4); }
        .pv-cta-btn.outline:hover { border-color: white; }
      `}</style>

      {/* ── HEADER ── */}
      <div className="pv-topbar">
        <div className="pv-logo">
          <div className="pv-logo-icon">🏛</div>
          <span className="pv-logo-text">District <span>1921</span></span>
        </div>
        <nav className="pv-topnav">
          <a href="#">Browse</a>
          <a href="#">Map View</a>
          <a href="#">Add a Business</a>
          <a href="#" className="nav-cta">Claim Your Page →</a>
        </nav>
      </div>

      {/* ── PREVIEW BANNER ── */}
      <div className="pv-banner">
        <p><strong>This is a platform preview.</strong> District 1921 launches Q3 2025. Pre-register to be first through the doors — and get 3 months free if you own a business.</p>
        <Link href="/" className="pv-back">← Back to waitlist</Link>
      </div>

      {/* ── VIEW TABS ── */}
      <div className="pv-tabs">
        <button className={`pv-tab ${view === 'search' ? 'active' : ''}`} onClick={() => setView('search')}>
          🗺 Search & Map View
        </button>
        <button className={`pv-tab ${view === 'profile' ? 'active' : ''}`} onClick={() => setView('profile')}>
          🏪 Business Profile Page
        </button>
      </div>

      {/* ══════════════════════════════════════
          SEARCH VIEW
      ══════════════════════════════════════ */}
      {view === 'search' && (
        <>
          <div className="pv-hero">
            <p className="pv-hero-label">The Community Business Directory</p>
            <h1 className="pv-hero h1">Find. Support. Share.</h1>
            <p className="pv-hero p">Discover community businesses — added by owners and the community. Free to search.</p>
            <div className="pv-search-bar">
              <div className="pv-search-field">
                <span style={{ color: 'var(--muted)' }}>🔍</span>
                <input type="text" placeholder="Business name, category, keyword…" defaultValue="Soul food restaurants" readOnly />
              </div>
              <div className="pv-loc-field">
                <span style={{ color: 'var(--muted)' }}>📍</span>
                <input type="text" placeholder="City or ZIP" defaultValue="Atlanta, GA" readOnly />
              </div>
              <button className="pv-search-btn">Search</button>
            </div>
            <div className="pv-pills">
              {['🍽 Food & Dining', '💇 Beauty & Wellness', '⚖️ Legal & Finance', '🏗 Contractors', '🩺 Healthcare', '🛒 Retail'].map(p => (
                <div key={p} className={`pv-pill ${p.includes('Food') ? 'active' : ''}`}>{p}</div>
              ))}
            </div>
          </div>

          <div className="pv-main">
            <div className="pv-content">
              <div className="pv-result-bar">
                <p className="pv-count">Showing <strong>184 results</strong> near Atlanta, GA</p>
                <div className="pv-view-btns">
                  <button className="pv-vbtn active">🗺 Map</button>
                  <button className="pv-vbtn">☰ List</button>
                  <button className="pv-vbtn">⊞ Grid</button>
                </div>
              </div>

              {/* Map */}
              <div className="pv-map">
                <div className="pv-map-grid" />
                {/* Streets */}
                <div className="pv-map-street-h" style={{ top: '40%' }} />
                <div className="pv-map-street-h" style={{ top: '65%' }} />
                <div className="pv-map-street-v" style={{ left: '30%' }} />
                <div className="pv-map-street-v" style={{ left: '60%' }} />
                {/* Pins */}
                <div className="pv-map-pin" style={{ top: '28%', left: '38%' }}>
                  <div className="pv-pin-dot gold" />
                  <div className="pv-pin-label">Mama Lou's ⭐4.9</div>
                </div>
                <div className="pv-map-pin" style={{ top: '48%', left: '58%' }}>
                  <div className="pv-pin-dot green" />
                  <div className="pv-pin-label">Peach Tree Grille</div>
                </div>
                <div className="pv-map-pin" style={{ top: '60%', left: '28%' }}>
                  <div className="pv-pin-dot green" />
                  <div className="pv-pin-label">Kingsley Catering</div>
                </div>
                <div className="pv-map-pin" style={{ top: '22%', left: '68%' }}>
                  <div className="pv-pin-dot gold" />
                  <div className="pv-pin-label">Sweet Auburn Café ⭐4.7</div>
                </div>
                <div className="pv-map-pin" style={{ top: '70%', left: '70%' }}>
                  <div className="pv-pin-dot green" />
                  <div className="pv-pin-label">Granny's Kitchen</div>
                </div>
                <div className="pv-map-legend">
                  <div className="pv-legend-item"><div className="pv-legend-dot" style={{ background: 'var(--gold)' }} /> Professional Page</div>
                  <div className="pv-legend-item"><div className="pv-legend-dot" style={{ background: 'var(--gm)' }} /> Free Listing</div>
                </div>
                <div className="pv-map-ctrl">
                  <div className="pv-ctrl-btn">＋</div>
                  <div className="pv-ctrl-btn">－</div>
                  <div className="pv-ctrl-btn">◎</div>
                </div>
              </div>

              {/* Filter chips */}
              <div className="pv-filters">
                {['All', '⭐ 4.5+', '🟢 Open Now', '🏅 Gold Shield', '📸 Has Photos', '🚐 Mobile Service'].map(f => (
                  <div key={f} className={`pv-chip ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>{f}</div>
                ))}
              </div>

              {/* Listings */}
              <div className="pv-listings">
                {/* Featured professional card */}
                <div className="pv-card featured" onClick={() => setView('profile')}>
                  <div className="pv-feat-badge">★ Professional Page</div>
                  <div className="pv-logo-box">M</div>
                  <div>
                    <div className="pv-biz-name">
                      Mama Lou's Southern Kitchen
                      <span className="pv-shield" title="Gold Shield Verified">🛡</span>
                    </div>
                    <div className="pv-biz-cat">🍽 Soul Food · Restaurant</div>
                    <div className="pv-biz-meta">
                      <span className="pv-stars">★★★★★</span>
                      <span>(284 ratings)</span>
                      <span style={{ color: '#ccc' }}>·</span>
                      <span>1.2 mi</span>
                      <span style={{ color: '#ccc' }}>·</span>
                      <span className="pv-open o">Open Now</span>
                    </div>
                    <div className="pv-biz-desc">Authentic Southern cuisine with family recipes passed down four generations. Catering available for events up to 500 guests. Daily specials and Sunday buffet.</div>
                  </div>
                  <div className="pv-card-actions">
                    <button className="pv-act-btn g">↗ Share</button>
                    <button className="pv-act-btn gold">✉ Recommend</button>
                    <button className="pv-act-btn">♡ Save</button>
                  </div>
                </div>

                {/* Standard professional */}
                <div className="pv-card">
                  <div className="pv-logo-box" style={{ background: '#f0e8ff', color: '#6b21a8' }}>S</div>
                  <div>
                    <div className="pv-biz-name">
                      Sweet Auburn Café
                      <span className="pv-shield" title="Gold Shield Verified">🛡</span>
                    </div>
                    <div className="pv-biz-cat">🍽 Café · Bakery</div>
                    <div className="pv-biz-meta">
                      <span className="pv-stars">★★★★☆</span>
                      <span>(97 ratings)</span>
                      <span style={{ color: '#ccc' }}>·</span>
                      <span>2.4 mi</span>
                      <span style={{ color: '#ccc' }}>·</span>
                      <span className="pv-open o">Open Now</span>
                    </div>
                    <div className="pv-biz-desc">Farm-to-table brunch and locally roasted coffee in the heart of Sweet Auburn. Gluten-free options available daily.</div>
                  </div>
                  <div className="pv-card-actions">
                    <button className="pv-act-btn g">↗ Share</button>
                    <button className="pv-act-btn">♡ Save</button>
                  </div>
                </div>

                {/* Free listing */}
                <div className="pv-card">
                  <div className="pv-logo-box" style={{ background: '#fef3e2', color: '#c07030' }}>G</div>
                  <div>
                    <div className="pv-biz-name">Granny's Kitchen</div>
                    <div className="pv-biz-cat">🍽 Soul Food · Home Cooking</div>
                    <div className="pv-biz-meta">
                      <span className="pv-stars">★★★★★</span>
                      <span>(41 ratings)</span>
                      <span style={{ color: '#ccc' }}>·</span>
                      <span>3.1 mi</span>
                      <span style={{ color: '#ccc' }}>·</span>
                      <span className="pv-open c">Closed</span>
                    </div>
                    <div className="pv-biz-desc">Home-cooked meals made fresh daily. Community added this listing.</div>
                    <div className="pv-free-tag">Free listing · Added by community</div>
                  </div>
                  <div className="pv-card-actions">
                    <button className="pv-act-btn g">↗ Share</button>
                    <button className="pv-act-btn">♡ Save</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Ad column */}
            <div className="pv-ad-col">
              <div className="pv-promote">
                <h4>Own This Business?</h4>
                <p>Claim your page for $15/mo. Full profile, photos, priority placement.</p>
                <div className="pv-promote-btn">Claim Your Page →</div>
              </div>
              <div className="pv-ad-unit">
                <div className="pv-ad-label">Advertisement</div>
                <div className="pv-ad-body">
                  <div className="pv-ad-img">Atlanta Community<br /><span style={{ fontSize: '10px', opacity: 0.7, fontFamily: 'DM Sans', fontWeight: 400 }}>Credit Union · Est. 1968</span></div>
                  <div className="pv-ad-title">Banking Built for You</div>
                  <div className="pv-ad-sub">Low-rate loans, free checking, and community reinvestment.</div>
                  <div className="pv-ad-cta">Learn More</div>
                </div>
              </div>
              <div className="pv-ad-unit">
                <div className="pv-ad-label">Sponsored Listing</div>
                <div className="pv-ad-body">
                  <div className="pv-ad-img" style={{ background: 'linear-gradient(135deg, #8b5e3c, #5c3d1e)' }}>Roots & Culture<br /><span style={{ fontSize: '10px', opacity: 0.7, fontFamily: 'DM Sans', fontWeight: 400 }}>Afrocentric Bookstore</span></div>
                  <div className="pv-ad-title">Roots & Culture Books</div>
                  <div className="pv-ad-sub">Author events every weekend. 2,000+ titles. Coffee bar open daily.</div>
                  <div className="pv-ad-cta">View Full Page</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════
          BUSINESS PROFILE VIEW
      ══════════════════════════════════════ */}
      {view === 'profile' && (
        <div className="pv-profile">
          {/* Cover photo */}
          <div className="pv-cover">
            <div className="pv-cover-overlay" />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'rgba(255,255,255,0.15)', fontFamily: 'Playfair Display, serif', fontSize: '48px', fontWeight: 900 }}>
              MAMA LOU'S
            </div>
            <div className="pv-cover-label">
              <span className="pv-cover-tag">📸 6 Photos</span>
              <span className="pv-cover-tag">🎥 Street View</span>
            </div>
          </div>

          {/* Profile header */}
          <div className="pv-prof-header">
            <div className="pv-prof-logo">M</div>
            <div>
              <div className="pv-prof-name">
                Mama Lou's Southern Kitchen
                <span className="pv-shield-badge">🛡 Gold Shield</span>
              </div>
              <div className="pv-prof-cat">🍽 Soul Food · Restaurant · Catering</div>
              <div className="pv-prof-meta">
                <span className="pv-stars" style={{ fontSize: '14px' }}>★★★★★</span>
                <span style={{ fontWeight: 600 }}>4.9</span>
                <span style={{ color: '#ccc' }}>·</span>
                <span>284 community ratings</span>
                <span style={{ color: '#ccc' }}>·</span>
                <span>1.2 mi from you</span>
                <span style={{ color: '#ccc' }}>·</span>
                <span className="pv-open o" style={{ fontSize: '12px', padding: '3px 8px' }}>Open Now · Closes 9pm</span>
              </div>
            </div>
            <div className="pv-prof-actions">
              <button className="pv-prof-btn primary">📞 Call</button>
              <button className="pv-prof-btn outline">🗺 Directions</button>
              <button className="pv-prof-btn gold-btn">♡ Follow</button>
            </div>
          </div>

          {/* Stats */}
          <div className="pv-stats-row">
            <div className="pv-stat-box"><div className="pv-stat-num">1,204</div><div className="pv-stat-label">Check-ins</div></div>
            <div className="pv-stat-box"><div className="pv-stat-num">847</div><div className="pv-stat-label">Followers</div></div>
            <div className="pv-stat-box"><div className="pv-stat-num">312</div><div className="pv-stat-label">Shares</div></div>
            <div className="pv-stat-box"><div className="pv-stat-num">4.9</div><div className="pv-stat-label">Avg Rating</div></div>
          </div>

          <div className="pv-prof-body">
            {/* Left column */}
            <div>
              {/* Description */}
              <div className="pv-section-card">
                <div className="pv-section-title">About <span>Share →</span></div>
                <p className="pv-desc">Mama Lou's has been serving authentic Southern cuisine in Atlanta since 1987. Every recipe has been passed down through four generations — the cornbread, the collard greens, the smothered chicken, all made from scratch every morning.</p>
                <p className="pv-desc" style={{ marginTop: '12px' }}>Catering available for events from 20 to 500 guests. We do corporate lunches, church events, family reunions, and weddings.</p>
              </div>

              {/* Deals */}
              <div className="pv-section-card">
                <div className="pv-section-title">Active Deals</div>
                <div className="pv-deals">
                  <div className="pv-deal">
                    <div className="pv-deal-icon">🍳</div>
                    <div>
                      <div className="pv-deal-title">Sunday Buffet — $18.99</div>
                      <div className="pv-deal-desc">All-you-can-eat Southern buffet every Sunday 11am–3pm. Dine-in only.</div>
                    </div>
                  </div>
                  <div className="pv-deal">
                    <div className="pv-deal-icon">🎂</div>
                    <div>
                      <div className="pv-deal-title">Birthday Special — Free Dessert</div>
                      <div className="pv-deal-desc">Show your ID on your birthday for a free slice of peach cobbler.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photos */}
              <div className="pv-section-card">
                <div className="pv-section-title">Photos <span>View all 6 →</span></div>
                <div className="pv-photos">
                  <div className="pv-photo" />
                  <div className="pv-photo" />
                  <div className="pv-photo" />
                </div>
              </div>

              {/* Ratings */}
              <div className="pv-section-card">
                <div className="pv-section-title">Community Ratings</div>
                <div className="pv-rating-big">
                  <div className="pv-rating-num">4.9</div>
                  <div>
                    <div className="pv-rating-stars">★★★★★</div>
                    <div className="pv-rating-sub">284 community ratings · 3–5 stars only</div>
                  </div>
                </div>
                <div className="pv-checkin-banner">
                  <strong>1,204</strong> community members have checked in here
                </div>
              </div>
            </div>

            {/* Right column */}
            <div>
              {/* Gold Shield */}
              <div className="pv-shield-card">
                <div className="pv-shield-title">🛡 Gold Shield Verified</div>
                <div className="pv-shield-checks">
                  <div className="pv-shield-check"><span className="pv-check-icon pass">✓</span> Secretary of State — Business registered in GA</div>
                  <div className="pv-shield-check"><span className="pv-check-icon pass">✓</span> Phone number verified</div>
                  <div className="pv-shield-check"><span className="pv-check-icon pass">✓</span> Website reachable</div>
                  <div className="pv-shield-check"><span className="pv-check-icon pass">✓</span> Proof photo reviewed by team</div>
                  <div className="pv-shield-check"><span className="pv-check-icon pass">✓</span> Honor Pledge signed by owner</div>
                </div>
              </div>

              {/* Contact */}
              <div className="pv-section-card">
                <div className="pv-section-title">Contact & Info</div>
                <div className="pv-contact-row">
                  <div className="pv-contact-icon">📞</div>
                  <div><div className="pv-contact-label">Phone</div><div className="pv-contact-val">(404) 555-0182</div></div>
                </div>
                <div className="pv-contact-row">
                  <div className="pv-contact-icon">🌐</div>
                  <div><div className="pv-contact-label">Website</div><div className="pv-contact-val">mamalous-atl.com</div></div>
                </div>
                <div className="pv-contact-row">
                  <div className="pv-contact-icon">📍</div>
                  <div><div className="pv-contact-label">Address</div><div className="pv-contact-val">284 Auburn Ave NE, Atlanta, GA 30312</div></div>
                </div>
              </div>

              {/* Hours */}
              <div className="pv-section-card">
                <div className="pv-section-title">Hours</div>
                <ul className="pv-hours">
                  <li className="today"><strong>Friday</strong> <strong style={{ color: 'var(--gm)' }}>11am – 9pm · Open</strong></li>
                  <li><strong>Saturday</strong> <span>11am – 9pm</span></li>
                  <li><strong>Sunday</strong> <span>11am – 3pm</span></li>
                  <li><strong>Monday</strong> <span>Closed</span></li>
                  <li><strong>Tuesday – Thursday</strong> <span>11am – 8pm</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BOTTOM CTA ── */}
      <div className="pv-cta-banner">
        <h3>Ready to be part of District 1921?</h3>
        <p>Pre-register now — community members get first access, business owners get 3 months free at launch.</p>
        <div className="pv-cta-btns">
          <Link href="/" className="pv-cta-btn primary">Join the Waitlist →</Link>
          <Link href="/" className="pv-cta-btn outline">Suggest a Business</Link>
        </div>
      </div>
    </div>
  )
}
