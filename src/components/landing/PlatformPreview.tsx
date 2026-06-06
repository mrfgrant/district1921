export function PlatformPreview() {
  return (
    <>
      <style>{`
        .pv * { box-sizing: border-box; margin: 0; padding: 0; }

        .pv {
          font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
          background: #faf7f0;
          color: #1c1c1c;
        }

        /* ── PREVIEW BANNER ── */
        .pv-banner {
          background: #c9a84c;
          color: #1a3a2a;
          text-align: center;
          padding: 10px 16px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.04em;
          position: sticky;
          top: 0;
          z-index: 200;
        }
        .pv-banner a { color: #1a3a2a; text-decoration: underline; text-underline-offset: 2px; margin-left: 16px; }

        /* ── HEADER ── */
        .pv-header {
          background: #1a3a2a;
          padding: 0 32px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 2px 20px rgba(0,0,0,0.25);
        }
        .pv-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .pv-logo-icon {
          width: 34px; height: 34px; background: #c9a84c; border-radius: 7px;
          display: flex; align-items: center; justify-content: center; font-size: 16px;
        }
        .pv-logo-text { font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-weight: 900; color: #fff; }
        .pv-logo-text span { color: #c9a84c; }
        .pv-nav { display: flex; align-items: center; gap: 24px; }
        .pv-nav a { color: rgba(255,255,255,0.75); text-decoration: none; font-size: 13px; font-weight: 500; }
        .pv-nav-cta {
          background: #c9a84c !important; color: #1a3a2a !important;
          padding: 8px 16px; border-radius: 6px; font-weight: 600 !important;
        }

        /* ── HERO SEARCH ── */
        .pv-hero {
          background: linear-gradient(135deg, #1a3a2a 0%, #2d6a4f 60%, #1a4a35 100%);
          padding: 48px 32px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .pv-hero::before {
          content: '';
          position: absolute; inset: 0;
          background-image: radial-gradient(circle at 20% 50%, rgba(201,168,76,0.08) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(64,145,108,0.12) 0%, transparent 40%);
        }
        .pv-hero-label {
          font-size: 10px; letter-spacing: 3px; color: #c9a84c;
          text-transform: uppercase; margin-bottom: 12px; position: relative;
        }
        .pv-hero h1 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 42px; font-weight: 900;
          color: #fff; line-height: 1.1;
          margin-bottom: 8px; position: relative;
        }
        .pv-hero p { color: rgba(255,255,255,0.65); font-size: 15px; margin-bottom: 28px; position: relative; }

        .pv-search-bar {
          display: flex; max-width: 680px; margin: 0 auto 20px;
          background: #fff; border-radius: 12px;
          overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.25); position: relative;
        }
        .pv-search-field {
          flex: 1; display: flex; align-items: center;
          padding: 0 16px; gap: 8px; border-right: 1px solid #e5e0d5;
        }
        .pv-search-field input {
          flex: 1; border: none; outline: none;
          font-size: 15px; color: #1c1c1c; background: transparent; padding: 16px 0;
        }
        .pv-loc-field { display: flex; align-items: center; padding: 0 16px; gap: 8px; min-width: 180px; }
        .pv-loc-field input {
          border: none; outline: none; font-size: 14px;
          color: #1c1c1c; background: transparent; padding: 16px 0; width: 130px;
        }
        .pv-si { color: #6b7280; font-size: 16px; }
        .pv-search-btn {
          background: #c9a84c; border: none; padding: 0 28px;
          font-weight: 600; font-size: 14px; color: #1a3a2a; cursor: pointer;
        }
        .pv-pills { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; position: relative; }
        .pv-pill {
          background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.85); padding: 6px 14px; border-radius: 20px;
          font-size: 12px; font-weight: 500; cursor: pointer;
        }
        .pv-pill.active { background: #c9a84c; border-color: #c9a84c; color: #1a3a2a; }

        /* ── MAIN LAYOUT ── */
        .pv-layout {
          display: grid; grid-template-columns: 1fr 280px;
          max-width: 1280px; margin: 0 auto; padding: 24px 16px; align-items: start; gap: 0;
        }
        .pv-content { padding-right: 24px; }

        .pv-view-toggle { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .pv-result-count { font-size: 13px; color: #6b7280; }
        .pv-result-count strong { color: #1c1c1c; }
        .pv-toggle-btns {
          display: flex; background: #fff; border: 1px solid #e5e0d5; border-radius: 8px; overflow: hidden;
        }
        .pv-toggle-btn {
          padding: 7px 14px; font-size: 12px; font-weight: 500;
          border: none; background: transparent; cursor: pointer; color: #6b7280;
          display: flex; align-items: center; gap: 5px;
        }
        .pv-toggle-btn.active { background: #1a3a2a; color: #fff; }

        /* ── MAP ── */
        .pv-map {
          background: #e8f4eb; border-radius: 14px; height: 260px;
          margin-bottom: 20px; position: relative; overflow: hidden; border: 1px solid #e5e0d5;
        }
        .pv-map-bg {
          position: absolute; inset: 0;
          background: linear-gradient(rgba(200,230,210,0.5) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(200,230,210,0.5) 1px, transparent 1px);
          background-size: 30px 30px;
        }
        .pv-pins { position: absolute; inset: 0; }
        .pv-pin { position: absolute; display: flex; flex-direction: column; align-items: center; cursor: pointer; }
        .pv-dot {
          width: 28px; height: 28px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .pv-dot-green { background: #2d6a4f; }
        .pv-dot-gold { background: #c9a84c; }
        .pv-dot-red { background: #c0392b; }
        .pv-pin-label {
          background: #fff; padding: 3px 7px; border-radius: 4px;
          font-size: 10px; font-weight: 600; color: #1c1c1c;
          white-space: nowrap; box-shadow: 0 1px 4px rgba(0,0,0,0.15); margin-top: 4px;
        }
        .pv-map-legend {
          position: absolute; bottom: 12px; left: 12px; background: #fff;
          border-radius: 8px; padding: 8px 12px; display: flex; gap: 12px;
          font-size: 11px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .pv-legend-item { display: flex; align-items: center; gap: 5px; color: #6b7280; font-weight: 500; }
        .pv-legend-dot { width: 10px; height: 10px; border-radius: 50%; }
        .pv-map-ctrls { position: absolute; top: 12px; right: 12px; display: flex; flex-direction: column; gap: 4px; }
        .pv-map-ctrl {
          width: 32px; height: 32px; background: #fff; border: 1px solid #e5e0d5;
          border-radius: 6px; display: flex; align-items: center; justify-content: center;
          font-size: 14px; cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }

        /* ── FILTERS ── */
        .pv-filters { display: flex; gap: 8px; margin-bottom: 16px; overflow-x: auto; padding-bottom: 4px; }
        .pv-chip {
          background: #fff; border: 1px solid #e5e0d5; border-radius: 20px;
          padding: 5px 12px; font-size: 12px; font-weight: 500; color: #6b7280;
          cursor: pointer; white-space: nowrap; display: flex; align-items: center; gap: 4px;
        }
        .pv-chip.active { background: #1a3a2a; border-color: #1a3a2a; color: #fff; }

        /* ── CARDS ── */
        .pv-listings { display: flex; flex-direction: column; gap: 14px; }
        .pv-card {
          background: #fff; border: 1px solid #e5e0d5; border-radius: 14px; padding: 18px;
          display: grid; grid-template-columns: 64px 1fr auto;
          gap: 16px; align-items: start; cursor: pointer; position: relative;
          transition: box-shadow 0.2s, border-color 0.2s;
        }
        .pv-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.08); border-color: #40916c; }
        .pv-card.premium { border-color: #c9a84c; background: linear-gradient(135deg, #fffdf5 0%, #fff 100%); }
        .pv-premium-badge {
          position: absolute; top: -1px; right: 20px;
          background: #c9a84c; color: #1a3a2a;
          font-size: 10px; font-weight: 700; padding: 3px 10px;
          border-radius: 0 0 6px 6px; letter-spacing: 0.5px; text-transform: uppercase;
        }
        .pv-biz-logo {
          width: 64px; height: 64px; border-radius: 10px; background: #d8f3dc;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 24px; font-weight: 700; color: #2d6a4f; flex-shrink: 0;
        }
        .pv-biz-info { min-width: 0; }
        .pv-biz-name {
          font-family: 'Playfair Display', Georgia, serif; font-size: 17px; font-weight: 700;
          color: #1c1c1c; margin-bottom: 3px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
        }
        .pv-shield {
          display: inline-flex; align-items: center; gap: 3px;
          background: #c9a84c; color: #1a3a2a;
          font-size: 9px; font-weight: 700; letter-spacing: 0.05em;
          padding: 2px 7px; border-radius: 4px; flex-shrink: 0; white-space: nowrap;
        }
        .pv-biz-cat { font-size: 11px; color: #2d6a4f; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 5px; }
        .pv-biz-meta { display: flex; align-items: center; gap: 10px; font-size: 12px; color: #6b7280; margin-bottom: 6px; flex-wrap: wrap; }
        .pv-stars { color: #c9a84c; font-size: 12px; letter-spacing: 1px; }
        .pv-sep { color: #ccc; }
        .pv-open { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 4px; }
        .pv-open.open { background: #e8f5e9; color: #2e7d32; }
        .pv-open.closed { background: #fdecea; color: #c62828; }
        .pv-mobile-badge { font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 4px; background: #e8f0fe; color: #3c4ec4; }
        .pv-biz-desc { font-size: 13px; color: #6b7280; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .pv-card-actions { display: flex; flex-direction: column; gap: 6px; align-items: flex-end; min-width: 80px; }
        .pv-action-btn {
          display: flex; align-items: center; gap: 4px;
          font-size: 11px; font-weight: 600; padding: 5px 10px; border-radius: 6px;
          border: 1px solid #e5e0d5; cursor: pointer; background: #fff; color: #6b7280; white-space: nowrap;
        }
        .pv-action-btn.share { color: #2d6a4f; border-color: #2d6a4f; }

        /* ── RIGHT COLUMN ── */
        .pv-sidebar { position: sticky; top: 80px; display: flex; flex-direction: column; gap: 16px; }
        .pv-promote {
          background: linear-gradient(135deg, #1a3a2a, #2d6a4f);
          border-radius: 12px; padding: 20px; color: #fff; text-align: center;
        }
        .pv-promote h4 { font-family: 'Playfair Display', Georgia, serif; font-size: 16px; margin-bottom: 6px; }
        .pv-promote p { font-size: 12px; opacity: 0.75; margin-bottom: 14px; line-height: 1.5; }
        .pv-promote-cta {
          background: #c9a84c; color: #1a3a2a; padding: 10px 16px;
          border-radius: 6px; font-size: 12px; font-weight: 700;
          display: block; cursor: pointer; text-decoration: none;
        }
        .pv-ad-unit { background: #fff; border: 1px solid #e5e0d5; border-radius: 12px; overflow: hidden; }
        .pv-ad-label { font-size: 9px; font-weight: 700; letter-spacing: 1.5px; color: #6b7280; text-transform: uppercase; text-align: right; padding: 6px 10px 0; }
        .pv-ad-card { padding: 14px; }
        .pv-ad-img {
          width: 100%; height: 110px; border-radius: 8px;
          background: linear-gradient(135deg, #2d6a4f, #1a3a2a);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-family: 'Playfair Display', Georgia, serif;
          font-size: 14px; font-weight: 700; margin-bottom: 10px; text-align: center; padding: 12px;
        }
        .pv-ad-title { font-size: 13px; font-weight: 600; color: #1c1c1c; margin-bottom: 4px; }
        .pv-ad-sub { font-size: 11px; color: #6b7280; margin-bottom: 10px; line-height: 1.4; }
        .pv-ad-cta {
          display: block; background: #1a3a2a; color: #fff;
          text-align: center; padding: 8px; border-radius: 6px;
          font-size: 12px; font-weight: 600; text-decoration: none; cursor: pointer;
        }

        /* ── SECTION DIVIDER ── */
        .pv-divider {
          background: #1a3a2a; padding: 32px 40px;
          display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;
        }
        .pv-divider h2 { font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 900; color: #fff; }
        .pv-divider p { font-size: 13px; color: rgba(255,255,255,0.6); margin-top: 4px; }
        .pv-divider-tag {
          background: #c9a84c; color: #1a3a2a; padding: 6px 14px; border-radius: 6px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
        }

        /* ── BUSINESS PROFILE ── */
        .pv-biz-profile { max-width: 1280px; margin: 0 auto; padding: 0 16px 80px; }
        .pv-cover {
          height: 240px; position: relative;
          background: linear-gradient(135deg, #1a3a2a 0%, #2d6a4f 60%, #40916c 100%);
          border-radius: 0 0 16px 16px; overflow: hidden;
        }
        .pv-cover-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.35) 100%); }
        .pv-cover-content { position: absolute; bottom: 24px; left: 24px; right: 24px; display: flex; align-items: flex-end; gap: 20px; }
        .pv-cover-logo {
          width: 88px; height: 88px; border-radius: 14px; background: #fff;
          border: 3px solid #fff; display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', Georgia, serif; font-size: 36px; font-weight: 700;
          color: #2d6a4f; flex-shrink: 0; box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        }
        .pv-cover-name {
          font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 900;
          color: #fff; display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
        }
        .pv-cover-cat { font-size: 13px; color: rgba(255,255,255,0.75); margin-top: 4px; }

        .pv-profile-body { display: grid; grid-template-columns: 1fr 300px; gap: 32px; margin-top: 32px; }

        /* Stats */
        .pv-stats { display: flex; border: 1px solid #e5e0d5; border-radius: 12px; overflow: hidden; margin-bottom: 24px; background: #fff; }
        .pv-stat { flex: 1; padding: 16px; text-align: center; border-right: 1px solid #e5e0d5; }
        .pv-stat:last-child { border-right: none; }
        .pv-stat-num { font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 900; color: #1a3a2a; line-height: 1; margin-bottom: 4px; }
        .pv-stat-label { font-size: 11px; color: #6b7280; letter-spacing: 0.05em; }

        .pv-biz-card { background: #fff; border: 1px solid #e5e0d5; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
        .pv-biz-card h3 {
          font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: 700;
          color: #1c1c1c; margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid #e5e0d5;
        }
        .pv-about { font-size: 14px; line-height: 1.75; color: #6b7280; }
        .pv-about strong { color: #1c1c1c; }

        .pv-photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .pv-photo {
          aspect-ratio: 1; border-radius: 8px; background: #d8f3dc;
          display: flex; align-items: center; justify-content: center; font-size: 28px; cursor: pointer;
        }
        .pv-photo.large { grid-column: span 2; aspect-ratio: 2/1; }

        .pv-hours-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e0d5; font-size: 13px; }
        .pv-hours-row:last-child { border-bottom: none; }
        .pv-hours-day { color: #1c1c1c; font-weight: 500; }
        .pv-hours-time { color: #6b7280; }
        .pv-hours-row.today { background: #d8f3dc; margin: 0 -24px; padding: 8px 24px; }
        .pv-hours-row.today .pv-hours-day { color: #1a3a2a; font-weight: 700; }
        .pv-hours-row.today .pv-hours-time { color: #2d6a4f; font-weight: 600; }

        .pv-deals { display: flex; flex-direction: column; gap: 10px; }
        .pv-deal { border: 1px solid #e5e0d5; border-radius: 8px; padding: 12px 14px; display: flex; align-items: center; gap: 12px; }
        .pv-deal-icon { font-size: 22px; flex-shrink: 0; }
        .pv-deal-title { font-size: 13px; font-weight: 600; color: #1c1c1c; margin-bottom: 2px; }
        .pv-deal-sub { font-size: 12px; color: #6b7280; }
        .pv-deal-badge { margin-left: auto; background: #f5e6c0; color: #7a5c00; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; white-space: nowrap; flex-shrink: 0; }

        .pv-checkin-bar {
          background: #d8f3dc; border: 1px solid #b8e0c4; border-radius: 8px;
          padding: 12px 16px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; font-size: 13px; color: #1a3a2a;
        }
        .pv-checkin-bar strong { font-weight: 700; }
        .pv-checkin-btn { margin-left: auto; background: #1a3a2a; color: #fff; border: none; padding: 7px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }

        /* Sidebar cards */
        .pv-contact-card { background: #fff; border: 1px solid #e5e0d5; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
        .pv-contact-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #e5e0d5; font-size: 13px; }
        .pv-contact-row:last-child { border-bottom: none; }
        .pv-contact-icon { font-size: 16px; flex-shrink: 0; width: 20px; text-align: center; }
        .pv-contact-val { color: #2d6a4f; margin-left: auto; font-size: 12px; text-decoration: none; }

        .pv-shield-card { background: #1a3a2a; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 16px; }
        .pv-shield-icon { font-size: 36px; margin-bottom: 8px; }
        .pv-shield-title { font-family: 'Playfair Display', Georgia, serif; font-size: 16px; font-weight: 700; color: #c9a84c; margin-bottom: 6px; }
        .pv-shield-desc { font-size: 12px; color: rgba(255,255,255,0.65); line-height: 1.5; margin-bottom: 14px; }
        .pv-shield-checks { list-style: none; text-align: left; }
        .pv-shield-checks li { font-size: 12px; color: rgba(255,255,255,0.75); padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; gap: 8px; }
        .pv-shield-checks li:last-child { border-bottom: none; }
        .pv-shield-checks li::before { content: '✓'; color: #c9a84c; font-weight: 700; flex-shrink: 0; }

        .pv-cta-card { background: #f5e6c0; border: 1px solid #e8d090; border-radius: 12px; padding: 20px; text-align: center; }
        .pv-cta-card h4 { font-family: 'Playfair Display', Georgia, serif; font-size: 16px; font-weight: 700; color: #1c1c1c; margin-bottom: 6px; }
        .pv-cta-card p { font-size: 12px; color: #6b7280; margin-bottom: 14px; line-height: 1.5; }
        .pv-cta-btn { display: block; background: #1a3a2a; color: #fff; padding: 11px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none; cursor: pointer; margin-bottom: 8px; }
        .pv-cta-btn-sec { display: block; background: transparent; color: #1a3a2a; padding: 9px; border-radius: 8px; font-size: 12px; font-weight: 600; text-decoration: none; cursor: pointer; border: 1px solid #e5e0d5; }

        @media(max-width: 900px) {
          .pv-layout { grid-template-columns: 1fr; }
          .pv-sidebar { display: none; }
          .pv-profile-body { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="pv">
        {/* Banner */}
        <div className="pv-banner">
          🔎 Platform preview — not yet live &nbsp;&nbsp;
          <a href="/">← Back to district1921.com</a>
        </div>

        {/* Header */}
        <header className="pv-header">
          <a className="pv-logo" href="/">
            <div className="pv-logo-icon">🏛</div>
            <span className="pv-logo-text">District <span>1921</span></span>
          </a>
          <nav className="pv-nav">
            <a href="#">Browse</a>
            <a href="#">Map View</a>
            <a href="#">Add a Business</a>
            <a href="/" className="pv-nav-cta">Pre-Register →</a>
          </nav>
        </header>

        {/* Hero Search */}
        <div className="pv-hero">
          <div className="pv-hero-label">The Community Business Directory</div>
          <h1>Find. Support. Share.</h1>
          <p>Discover community businesses — added by owners and members alike.</p>
          <div className="pv-search-bar">
            <div className="pv-search-field">
              <span className="pv-si">🔍</span>
              <input type="text" defaultValue="Soul food restaurants" placeholder="Business, category..." readOnly />
            </div>
            <div className="pv-loc-field">
              <span className="pv-si">📍</span>
              <input type="text" defaultValue="Augusta, GA" readOnly />
            </div>
            <button className="pv-search-btn">Search</button>
          </div>
          <div className="pv-pills">
            <div className="pv-pill active">🍽 Food & Dining</div>
            <div className="pv-pill">💇 Beauty & Wellness</div>
            <div className="pv-pill">⚖️ Legal & Finance</div>
            <div className="pv-pill">🏗 Contractors</div>
            <div className="pv-pill">🩺 Healthcare</div>
            <div className="pv-pill">✂️ Barbershop</div>
          </div>
        </div>

        {/* Main layout */}
        <div className="pv-layout">
          <div className="pv-content">
            <div className="pv-view-toggle">
              <div className="pv-result-count">Showing <strong>247 businesses</strong> near Augusta, GA</div>
              <div className="pv-toggle-btns">
                <button className="pv-toggle-btn active">🗺 Map</button>
                <button className="pv-toggle-btn">☰ List</button>
                <button className="pv-toggle-btn">⊞ Grid</button>
              </div>
            </div>

            {/* Map */}
            <div className="pv-map">
              <div className="pv-map-bg" />
              <div className="pv-pins">
                <div className="pv-pin" style={{top:'28%',left:'34%'}}><div className="pv-dot pv-dot-gold" /><div className="pv-pin-label">Mama's Kitchen ★4.9</div></div>
                <div className="pv-pin" style={{top:'48%',left:'54%'}}><div className="pv-dot pv-dot-green" /><div className="pv-pin-label">JSG Barbershop</div></div>
                <div className="pv-pin" style={{top:'62%',left:'24%'}}><div className="pv-dot pv-dot-green" /><div className="pv-pin-label">Grant Legal Group</div></div>
                <div className="pv-pin" style={{top:'22%',left:'64%'}}><div className="pv-dot pv-dot-red" /><div className="pv-pin-label">Sponsored</div></div>
                <div className="pv-pin" style={{top:'68%',left:'70%'}}><div className="pv-dot pv-dot-green" /><div className="pv-pin-label">Cloud Nine Salon</div></div>
                <div className="pv-pin" style={{top:'40%',left:'76%'}}><div className="pv-dot pv-dot-green" /><div className="pv-pin-label">Apex Auto</div></div>
              </div>
              <div className="pv-map-legend">
                <div className="pv-legend-item"><div className="pv-legend-dot" style={{background:'#c9a84c'}} /> Pro Page</div>
                <div className="pv-legend-item"><div className="pv-legend-dot" style={{background:'#2d6a4f'}} /> Listed</div>
                <div className="pv-legend-item"><div className="pv-legend-dot" style={{background:'#c0392b'}} /> Sponsored</div>
              </div>
              <div className="pv-map-ctrls">
                <div className="pv-map-ctrl">＋</div>
                <div className="pv-map-ctrl">－</div>
                <div className="pv-map-ctrl">◎</div>
              </div>
            </div>

            {/* Filters */}
            <div className="pv-filters">
              <div className="pv-chip active">All</div>
              <div className="pv-chip">⭐ 4.5+</div>
              <div className="pv-chip">🟢 Open Now</div>
              <div className="pv-chip">🛡 Gold Shield</div>
              <div className="pv-chip">📸 Has Photos</div>
              <div className="pv-chip">📱 Mobile Service</div>
              <div className="pv-chip">🏅 Community Pick</div>
            </div>

            {/* Listing cards */}
            <div className="pv-listings">
              <div className="pv-card premium">
                <div className="pv-premium-badge">★ Featured</div>
                <div className="pv-biz-logo">M</div>
                <div className="pv-biz-info">
                  <div className="pv-biz-name">Mama's Southern Kitchen <span className="pv-shield">🛡 Gold Shield</span></div>
                  <div className="pv-biz-cat">🍽 Soul Food · Restaurant</div>
                  <div className="pv-biz-meta">
                    <span className="pv-stars">★★★★★</span><span>4.9</span>
                    <span className="pv-sep">·</span><span>312 ratings</span>
                    <span className="pv-sep">·</span><span>0.8 mi</span>
                    <span className="pv-sep">·</span><span className="pv-open open">Open Now</span>
                  </div>
                  <div className="pv-biz-desc">Authentic Southern cuisine with family recipes passed down four generations. Catering available for events up to 500 guests. Daily specials and Sunday buffet 11am–3pm.</div>
                </div>
                <div className="pv-card-actions">
                  <button className="pv-action-btn share">↗ Share</button>
                  <button className="pv-action-btn">♡ Save</button>
                </div>
              </div>

              <div className="pv-card">
                <div className="pv-biz-logo" style={{background:'#f0e8ff',color:'#6b21a8'}}>J</div>
                <div className="pv-biz-info">
                  <div className="pv-biz-name">JSG Barbershop & Grooming</div>
                  <div className="pv-biz-cat">✂️ Barbershop · Grooming</div>
                  <div className="pv-biz-meta">
                    <span className="pv-stars">★★★★☆</span><span>4.3</span>
                    <span className="pv-sep">·</span><span>89 ratings</span>
                    <span className="pv-sep">·</span><span>1.4 mi</span>
                    <span className="pv-sep">·</span><span className="pv-open open">Open Now</span>
                  </div>
                  <div className="pv-biz-desc">Classic cuts and modern fades. Walk-ins welcome. Book online for priority service. Senior discounts available.</div>
                </div>
                <div className="pv-card-actions">
                  <button className="pv-action-btn share">↗ Share</button>
                  <button className="pv-action-btn">♡ Save</button>
                </div>
              </div>

              <div className="pv-card">
                <div className="pv-biz-logo" style={{background:'#fef3c7',color:'#d97706'}}>C</div>
                <div className="pv-biz-info">
                  <div className="pv-biz-name">Cloud Nine Braiding Studio <span className="pv-shield">🛡 Gold Shield</span></div>
                  <div className="pv-biz-cat">💇 Beauty · Natural Hair</div>
                  <div className="pv-biz-meta">
                    <span className="pv-stars">★★★★★</span><span>5.0</span>
                    <span className="pv-sep">·</span><span>156 ratings</span>
                    <span className="pv-sep">·</span><span className="pv-mobile-badge">📱 Mobile Service</span>
                    <span className="pv-sep">·</span><span className="pv-open open">Open Now</span>
                  </div>
                  <div className="pv-biz-desc">Knotless braids, locs, and protective styles. Mobile appointments available across Augusta. Book 48 hrs in advance.</div>
                </div>
                <div className="pv-card-actions">
                  <button className="pv-action-btn share">↗ Share</button>
                  <button className="pv-action-btn">♡ Save</button>
                </div>
              </div>

              <div className="pv-card">
                <div className="pv-biz-logo" style={{background:'#fff0f0',color:'#be123c'}}>G</div>
                <div className="pv-biz-info">
                  <div className="pv-biz-name">Grant Legal Group</div>
                  <div className="pv-biz-cat">⚖️ Legal Services · Attorney</div>
                  <div className="pv-biz-meta">
                    <span className="pv-stars">★★★★★</span><span>4.8</span>
                    <span className="pv-sep">·</span><span>47 ratings</span>
                    <span className="pv-sep">·</span><span>2.1 mi</span>
                    <span className="pv-sep">·</span><span className="pv-open closed">Closed</span>
                  </div>
                  <div className="pv-biz-desc">Veteran-owned practice specializing in civil rights, personal injury, and VA disability claims.</div>
                </div>
                <div className="pv-card-actions">
                  <button className="pv-action-btn share">↗ Share</button>
                  <button className="pv-action-btn">♡ Save</button>
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="pv-sidebar">
            <div className="pv-promote">
              <h4>Own This Business?</h4>
              <p>Claim your page free. Upgrade to a Professional Page for $15/mo — full profile, analytics, and leads.</p>
              <a href="/" className="pv-promote-cta">Claim Your Page →</a>
            </div>
            <div className="pv-ad-unit">
              <div className="pv-ad-label">Advertisement</div>
              <div className="pv-ad-card">
                <div className="pv-ad-img">Augusta Community<br />Credit Union<br /><small style={{opacity:0.7,fontSize:'11px'}}>Est. 1966</small></div>
                <div className="pv-ad-title">Banking That Works For You</div>
                <div className="pv-ad-sub">Low-rate loans, free checking, community reinvestment.</div>
                <div className="pv-ad-cta">Learn More</div>
              </div>
            </div>
            <div className="pv-ad-unit">
              <div className="pv-ad-label">Sponsored Listing</div>
              <div className="pv-ad-card">
                <div className="pv-ad-img" style={{background:'linear-gradient(135deg,#8b5e3c,#5c3d1e)'}}>Roots & Culture<br /><small style={{opacity:0.7,fontSize:'11px'}}>Afrocentric Bookstore & Café</small></div>
                <div className="pv-ad-title">Roots & Culture Bookstore</div>
                <div className="pv-ad-sub">Author events every weekend. 2,000+ titles. Coffee bar daily.</div>
                <div className="pv-ad-cta">View Full Page</div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="pv-divider">
          <div>
            <h2>Business Profile Page</h2>
            <p>What a Professional Page looks like — full profile, photos, hours, deals, and Gold Shield verification.</p>
          </div>
          <div className="pv-divider-tag">Pro Page · $15/mo</div>
        </div>

        {/* Business Profile */}
        <div className="pv-biz-profile">
          <div className="pv-cover">
            <div className="pv-cover-overlay" />
            <div className="pv-cover-content">
              <div className="pv-cover-logo">M</div>
              <div>
                <div className="pv-cover-name">
                  Mama's Southern Kitchen
                  <span className="pv-shield" style={{fontSize:'11px',padding:'4px 10px'}}>🛡 Gold Shield Verified</span>
                </div>
                <div className="pv-cover-cat">🍽 Soul Food · Restaurant &nbsp;·&nbsp; Augusta, GA</div>
              </div>
            </div>
          </div>

          <div className="pv-profile-body">
            <div>
              <div className="pv-checkin-bar">
                👥 <span><strong>1,247</strong> community members have visited</span>
                <button className="pv-checkin-btn">Check In</button>
              </div>

              <div className="pv-stats">
                <div className="pv-stat"><div className="pv-stat-num">4.9</div><div className="pv-stat-label">Community Rating</div></div>
                <div className="pv-stat"><div className="pv-stat-num">312</div><div className="pv-stat-label">Ratings</div></div>
                <div className="pv-stat"><div className="pv-stat-num">1.2k</div><div className="pv-stat-label">Followers</div></div>
                <div className="pv-stat"><div className="pv-stat-num">847</div><div className="pv-stat-label">Shares</div></div>
              </div>

              <div className="pv-biz-card">
                <h3>About</h3>
                <p className="pv-about">Mama's Southern Kitchen has been feeding Augusta since 1987. Founded by Dorothy "Mama" Williams, our family recipes have been passed down through four generations — from her grandmother's kitchen in Eatonton, Georgia to our dining room today.<br /><br />We specialize in <strong>authentic soul food</strong> prepared daily from scratch: fried chicken, catfish, oxtails, collard greens, cornbread, and our famous Sunday buffet. Catering available for events up to 500 guests.</p>
              </div>

              <div className="pv-biz-card">
                <h3>Photos</h3>
                <div className="pv-photo-grid">
                  <div className="pv-photo large" style={{background:'linear-gradient(135deg,#8b5e3c,#c49a6c)'}}>🍗</div>
                  <div className="pv-photo" style={{background:'linear-gradient(135deg,#5c3d1e,#8b5e3c)'}}>🥘</div>
                  <div className="pv-photo" style={{background:'linear-gradient(135deg,#2d6a4f,#40916c)'}}>🥗</div>
                  <div className="pv-photo" style={{background:'linear-gradient(135deg,#1a3a2a,#2d6a4f)'}}>🍞</div>
                  <div className="pv-photo" style={{background:'linear-gradient(135deg,#7a5c2a,#c9a84c)'}}>🥧</div>
                </div>
              </div>

              <div className="pv-biz-card">
                <h3>Active Deals</h3>
                <div className="pv-deals">
                  <div className="pv-deal"><div className="pv-deal-icon">🍗</div><div><div className="pv-deal-title">Sunday Buffet Special</div><div className="pv-deal-sub">All-you-can-eat · Sundays 11am–3pm</div></div><div className="pv-deal-badge">$18.99</div></div>
                  <div className="pv-deal"><div className="pv-deal-icon">👴</div><div><div className="pv-deal-title">Senior Discount</div><div className="pv-deal-sub">20% off for guests 60+ · Valid anytime</div></div><div className="pv-deal-badge">20% OFF</div></div>
                </div>
              </div>

              <div className="pv-biz-card">
                <h3>Hours</h3>
                <div className="pv-hours-row today"><span className="pv-hours-day">Friday (Today)</span><span className="pv-hours-time">11:00am – 9:00pm · Open now</span></div>
                <div className="pv-hours-row"><span className="pv-hours-day">Saturday</span><span className="pv-hours-time">11:00am – 9:00pm</span></div>
                <div className="pv-hours-row"><span className="pv-hours-day">Sunday</span><span className="pv-hours-time">11:00am – 7:00pm (Buffet)</span></div>
                <div className="pv-hours-row"><span className="pv-hours-day">Monday</span><span className="pv-hours-time">Closed</span></div>
                <div className="pv-hours-row"><span className="pv-hours-day">Tuesday – Thursday</span><span className="pv-hours-time">11:00am – 8:00pm</span></div>
              </div>
            </div>

            {/* Profile sidebar */}
            <div>
              <div className="pv-contact-card">
                <div className="pv-contact-row"><span className="pv-contact-icon">📞</span><span>(706) 555-0182</span><a href="#" className="pv-contact-val">Call →</a></div>
                <div className="pv-contact-row"><span className="pv-contact-icon">🌐</span><span>mamassouthernkitchen.com</span><a href="#" className="pv-contact-val">Visit →</a></div>
                <div className="pv-contact-row"><span className="pv-contact-icon">📍</span><span>1842 Broad St, Augusta, GA</span><a href="#" className="pv-contact-val">Directions →</a></div>
                <div className="pv-contact-row"><span className="pv-contact-icon">✉️</span><span>info@mamassouthern.com</span><a href="#" className="pv-contact-val">Email →</a></div>
              </div>

              <div className="pv-shield-card">
                <div className="pv-shield-icon">🛡</div>
                <div className="pv-shield-title">Gold Shield Verified</div>
                <div className="pv-shield-desc">This business has passed all four verification checks — confirming it is community-owned and operated.</div>
                <ul className="pv-shield-checks">
                  <li>Secretary of State registration confirmed</li>
                  <li>Business phone verified</li>
                  <li>Website reachable and active</li>
                  <li>Owner proof photo reviewed</li>
                </ul>
              </div>

              <div className="pv-cta-card">
                <h4>Is this your business?</h4>
                <p>Claim your free listing or upgrade to a Professional Page to unlock photos, hours, deals, analytics, and community leads.</p>
                <a href="/" className="pv-cta-btn">Claim This Page</a>
                <a href="/" className="pv-cta-btn-sec">Pre-Register for Launch</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
