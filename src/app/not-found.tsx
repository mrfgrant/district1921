import Link from 'next/link'

export const metadata = { title: 'Page Not Found — District 1921' }

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#faf7f0',
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      display: 'flex',
      flexDirection: 'column',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
      `}</style>

      {/* Header */}
      <header style={{
        background: '#1a3a2a',
        padding: '0 32px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 20px rgba(0,0,0,0.25)',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ width: 34, height: 34, background: '#c9a84c', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🏛</div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 900, color: '#fff' }}>
            District <span style={{ color: '#c9a84c' }}>1921</span>
          </span>
        </Link>
      </header>

      {/* Body */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{ maxWidth: 560, width: '100%' }}>

          {/* Year mark */}
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(96px, 20vw, 160px)',
            fontWeight: 900,
            color: '#e8e2d8',
            lineHeight: 1,
            marginBottom: -8,
            userSelect: 'none',
          }}>
            404
          </div>

          {/* Gold rule */}
          <div style={{ width: 64, height: 3, background: '#c9a84c', marginBottom: 28 }} />

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: 700,
            color: '#1a3a2a',
            marginBottom: 16,
            lineHeight: 1.15,
          }}>
            This page is still being built.
          </h1>

          <p style={{
            fontSize: 15,
            color: '#6b7280',
            lineHeight: 1.75,
            marginBottom: 12,
          }}>
            District 1921 is under active development. The page you're looking for is either not ready yet or doesn't exist.
          </p>

          <p style={{
            fontSize: 15,
            color: '#6b7280',
            lineHeight: 1.75,
            marginBottom: 36,
          }}>
            The full platform — search, map, business profiles, Gold Shield, deals, events, and jobs — is on its way. <strong style={{ color: '#1a3a2a' }}>Pre-register to be first through the doors.</strong>
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/" style={{
              display: 'inline-block',
              background: '#1a3a2a',
              color: '#fff',
              padding: '13px 28px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              letterSpacing: '0.03em',
            }}>
              ← Back to Home
            </Link>
            <Link href="/#register" style={{
              display: 'inline-block',
              background: '#c9a84c',
              color: '#1a3a2a',
              padding: '13px 28px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 700,
              textDecoration: 'none',
              letterSpacing: '0.03em',
            }}>
              Pre-Register →
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        background: '#1a3a2a',
        padding: '20px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 900, color: '#fff' }}>
          District <span style={{ color: '#c9a84c' }}>1921</span>
        </span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>
          © 2025 · All 50 States · Built for the community
        </span>
      </footer>
    </div>
  )
}
