'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export function LaunchModal() {
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    const seen = sessionStorage.getItem('launch_modal_seen')
    if (!seen) {
      const t = setTimeout(() => setVisible(true), 700)
      return () => clearTimeout(t)
    }
  }, [])

  function dismiss() {
    setClosing(true)
    setTimeout(() => {
      setVisible(false)
      sessionStorage.setItem('launch_modal_seen', '1')
    }, 350)
  }

  if (!visible) return null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400&display=swap');
        .lm-wrap {
          position:fixed;inset:0;z-index:999;
          background:rgba(8,18,12,0.80);
          backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
          display:flex;align-items:center;justify-content:center;padding:16px;
          animation:lmIn 0.4s ease forwards;
        }
        .lm-wrap.out { animation:lmOut 0.35s ease forwards; }
        .lm-box {
          background:rgba(22,48,34,0.97);
          border:1px solid rgba(201,168,76,0.35);
          border-radius:20px;padding:44px 36px 36px;
          max-width:500px;width:100%;position:relative;text-align:center;
          box-shadow:0 40px 80px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.05);
          animation:lmUp 0.45s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        .lm-wrap.out .lm-box { animation:lmDown 0.35s ease forwards; }
        .lm-x {
          position:absolute;top:14px;right:14px;width:30px;height:30px;
          background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);
          border-radius:50%;display:flex;align-items:center;justify-content:center;
          cursor:pointer;color:rgba(255,255,255,0.45);font-size:14px;
          transition:all 0.2s;
        }
        .lm-x:hover{background:rgba(255,255,255,0.12);color:#fff;}
        .lm-dot-wrap {
          display:inline-flex;align-items:center;gap:7px;
          background:rgba(201,168,76,0.1);border:1px solid rgba(201,168,76,0.25);
          border-radius:20px;padding:5px 13px;margin-bottom:22px;
          font-family:'DM Mono',monospace;font-size:9px;letter-spacing:0.22em;
          text-transform:uppercase;color:#c9a84c;
        }
        .lm-dot { width:6px;height:6px;border-radius:50%;background:#c9a84c;animation:lmPulse 1.6s ease infinite; }
        .lm-h {
          font-family:'Playfair Display',serif;
          font-size:clamp(26px,5vw,36px);font-weight:900;line-height:1.1;
          color:#fff;margin-bottom:14px;
        }
        .lm-h em{font-style:italic;color:#c9a84c;}
        .lm-p {
          font-family:'DM Sans',sans-serif;font-size:14px;line-height:1.75;
          color:rgba(255,255,255,0.68);margin-bottom:28px;
        }
        .lm-p strong{color:#fff;font-weight:600;}
        .lm-btn1 {
          display:block;background:#c9a84c;color:#1a3a2a;
          padding:14px;border-radius:10px;
          font-family:'DM Sans',sans-serif;font-size:14px;font-weight:700;
          text-decoration:none;margin-bottom:8px;transition:background 0.2s,transform 0.15s;
        }
        .lm-btn1:hover{background:#dbb95a;transform:translateY(-1px);}
        .lm-btn2 {
          display:block;background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.14);color:rgba(255,255,255,0.78);
          padding:13px;border-radius:10px;
          font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;
          text-decoration:none;margin-bottom:20px;transition:all 0.2s;
        }
        .lm-btn2:hover{background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.28);}
        .lm-share {
          border-top:1px solid rgba(255,255,255,0.08);padding-top:18px;margin-bottom:16px;
        }
        .lm-share-label {
          font-family:'DM Sans',sans-serif;font-size:10px;letter-spacing:0.12em;
          text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:10px;
        }
        .lm-share-row{display:flex;gap:8px;justify-content:center;}
        .lm-sb {
          display:inline-flex;align-items:center;gap:5px;padding:8px 13px;
          border-radius:8px;border:1px solid rgba(255,255,255,0.1);
          background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.6);
          font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;
          cursor:pointer;text-decoration:none;transition:all 0.2s;
        }
        .lm-sb:hover{background:rgba(255,255,255,0.1);color:#fff;border-color:rgba(255,255,255,0.22);}
        .lm-skip {
          font-family:'DM Sans',sans-serif;font-size:12px;
          color:rgba(255,255,255,0.3);cursor:pointer;background:none;border:none;
          transition:color 0.2s;
        }
        .lm-skip:hover{color:rgba(255,255,255,0.55);}
        @keyframes lmIn{from{opacity:0}to{opacity:1}}
        @keyframes lmOut{from{opacity:1}to{opacity:0}}
        @keyframes lmUp{from{opacity:0;transform:translateY(28px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes lmDown{from{opacity:1;transform:translateY(0) scale(1)}to{opacity:0;transform:translateY(16px) scale(0.97)}}
        @keyframes lmPulse{0%,100%{opacity:1}50%{opacity:0.25}}
      `}</style>

      <div className={`lm-wrap${closing ? ' out' : ''}`} onClick={e => { if (e.target === e.currentTarget) dismiss() }}>
        <div className="lm-box">

          <button className="lm-x" onClick={dismiss}>✕</button>

          <div className="lm-dot-wrap">
            <div className="lm-dot" />
            Under Construction · Pre-Launch
          </div>

          <h2 className="lm-h">
            We're building<br />
            <em>District 1921.</em>
          </h2>

          <p className="lm-p">
            The community business directory is <strong>actively under development</strong> and launching soon. Pre-register your business now to be listed on <strong>day one</strong> — before the doors open to the public.
          </p>

          <Link href="/#register" onClick={dismiss} className="lm-btn1">
            🏛 Register Your Business — It&apos;s Free
          </Link>

          <Link href="/#register" onClick={dismiss} className="lm-btn2">
            💡 Suggest a Business You Know
          </Link>

          <div className="lm-share">
            <p className="lm-share-label">Help us grow — spread the word</p>
            <div className="lm-share-row">
              <a className="lm-sb"
                href="https://twitter.com/intent/tweet?text=District%201921%20is%20building%20the%20community%20business%20directory%20we%20deserve.%20Pre-register%20before%20launch%20%E2%80%94%20free.&url=https://district1921.com"
                target="_blank" rel="noopener noreferrer">
                𝕏 Share
              </a>
              <a className="lm-sb"
                href="https://www.facebook.com/sharer/sharer.php?u=https://district1921.com"
                target="_blank" rel="noopener noreferrer">
                📘 Share
              </a>
              <button className="lm-sb" onClick={() => {
                navigator.clipboard?.writeText('https://district1921.com')
                const el = document.activeElement as HTMLButtonElement
                if (el) { const orig = el.innerHTML; el.innerHTML = '✓ Copied!'; setTimeout(() => { el.innerHTML = orig }, 2000) }
              }}>
                🔗 Copy
              </button>
            </div>
          </div>

          <button className="lm-skip" onClick={dismiss}>
            Continue browsing →
          </button>
        </div>
      </div>
    </>
  )
}
