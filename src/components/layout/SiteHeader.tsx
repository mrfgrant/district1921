'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser]             = useState<any>(null)
  const [role, setRole]             = useState<string>('user')
  const pathname                    = usePathname()
  const router                      = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user)
      if (user) {
        const { data: profile } = await supabase
          .from('profiles').select('role').eq('id', user.id).single()
        if (profile) setRole(profile.role)
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (!session) setRole('user')
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => setMobileOpen(false), [pathname])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const navLinks = [
    { href: '/search',   label: 'Search'   },
    { href: '/deals',    label: 'Deals'    },
    { href: '/events',   label: 'Events'   },
    { href: '/jobs',     label: 'Jobs'     },
    { href: '/requests', label: 'Requests' },
  ]

  const isAdmin = role === 'admin'
  const isOwner = ['free_owner', 'paid_owner', 'admin'].includes(role)

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: 'var(--forest-mid)',
        borderBottom: '1px solid var(--rule-mid)',
        height: 60,
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto', padding: '0 28px',
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 0 }} aria-label="District 1921 — Home">
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 21, fontWeight: 700,
              color: '#fff', letterSpacing: '-0.015em', lineHeight: 1,
            }}>
              District
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12, fontWeight: 400,
              color: 'var(--gold)',
              letterSpacing: '0.08em',
              marginLeft: 7,
              position: 'relative', top: -1,
            }}>
              1921
            </span>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="d1921-nav-desktop" aria-label="Primary navigation">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} style={{
                padding: '5px 11px',
                borderRadius: 'var(--radius)',
                fontSize: 13, fontWeight: 500,
                textDecoration: 'none',
                color: pathname === l.href ? '#fff' : 'rgba(255,255,255,0.58)',
                background: pathname === l.href ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: `color 150ms var(--ease-out), background 150ms var(--ease-out)`,
              }}
                onMouseEnter={e => { if (pathname !== l.href) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.9)' }}
                onMouseLeave={e => { if (pathname !== l.href) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.58)' }}
              >
                {l.label}
              </Link>
            ))}

            <div style={{ width: 1, height: 18, background: 'var(--rule-strong)', margin: '0 8px' }} aria-hidden="true" />

            {user ? (
              <>
                {isOwner && (
                  <Link href="/dashboard" style={{
                    padding: '5px 11px', borderRadius: 'var(--radius)',
                    fontSize: 13, fontWeight: 500, textDecoration: 'none',
                    color: 'rgba(255,255,255,0.58)',
                    transition: `color 150ms var(--ease-out)`,
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.9)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.58)' }}
                  >
                    Dashboard
                  </Link>
                )}
                {isAdmin && (
                  <Link href="/admin" style={{
                    padding: '5px 11px', borderRadius: 'var(--radius)',
                    fontSize: 13, fontWeight: 600, textDecoration: 'none',
                    color: 'var(--gold)',
                    transition: `color 150ms var(--ease-out)`,
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--gold-warm)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--gold)' }}
                  >
                    Admin
                  </Link>
                )}
                <button onClick={handleSignOut} style={{
                  padding: '6px 14px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--rule-strong)',
                  borderRadius: 'var(--radius)',
                  fontSize: 13, fontWeight: 500,
                  color: 'rgba(255,255,255,0.65)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  transition: `background 150ms var(--ease-out), color 150ms var(--ease-out), transform 80ms var(--ease-out)`,
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)' }}
                  onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.97)' }}
                  onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login?next=/onboarding" style={{
                  padding: '5px 11px', borderRadius: 'var(--radius)',
                  fontSize: 13, fontWeight: 500, textDecoration: 'none',
                  color: 'rgba(255,255,255,0.58)',
                  transition: `color 150ms var(--ease-out)`,
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.9)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.58)' }}
                >
                  List Your Business
                </Link>
                <Link href="/login" style={{
                  padding: '6px 14px',
                  background: 'var(--gold)',
                  borderRadius: 'var(--radius)',
                  fontSize: 13, fontWeight: 700,
                  textDecoration: 'none',
                  color: 'var(--forest)',
                  letterSpacing: '0.02em',
                  transition: `background 150ms var(--ease-out), transform 80ms var(--ease-out)`,
                  display: 'inline-block',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--gold-warm)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--gold)' }}
                  onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.97)' }}
                  onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
                >
                  Sign In
                </Link>
              </>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="d1921-nav-mobile"
            style={{
              background: 'none', border: 'none',
              cursor: 'pointer', padding: '6px 8px',
              color: '#fff', lineHeight: 1,
              transition: `opacity 150ms var(--ease-out)`,
            }}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {/* Hamburger / close icon via SVG — no emoji */}
            {mobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', top: 60, left: 0, right: 0, bottom: 0,
          background: 'var(--forest-mid)', zIndex: 190,
          overflowY: 'auto', padding: '8px 0',
          borderTop: '1px solid var(--rule-mid)',
        }} role="dialog" aria-label="Navigation menu">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} style={{
              display: 'block', padding: '14px 28px',
              fontSize: 16, fontWeight: 500,
              color: pathname === l.href ? '#fff' : 'rgba(255,255,255,0.72)',
              textDecoration: 'none',
              borderBottom: '1px solid var(--rule)',
              background: pathname === l.href ? 'rgba(255,255,255,0.06)' : 'transparent',
            }}>
              {l.label}
            </Link>
          ))}
          <div style={{ height: 1, background: 'var(--rule-mid)', margin: '8px 0' }} />
          {user ? (
            <>
              {isOwner && (
                <Link href="/dashboard" style={{ display: 'block', padding: '14px 28px', fontSize: 16, fontWeight: 500, color: 'rgba(255,255,255,0.72)', textDecoration: 'none', borderBottom: '1px solid var(--rule)' }}>
                  Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link href="/admin" style={{ display: 'block', padding: '14px 28px', fontSize: 16, fontWeight: 600, color: 'var(--gold)', textDecoration: 'none', borderBottom: '1px solid var(--rule)' }}>
                  Admin Panel
                </Link>
              )}
              <button onClick={handleSignOut} style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '14px 28px', fontSize: 16, fontWeight: 500,
                color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none',
                cursor: 'pointer', fontFamily: 'var(--font-body)',
                borderBottom: '1px solid var(--rule)',
              }}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login?next=/onboarding" style={{ display: 'block', padding: '14px 28px', fontSize: 16, fontWeight: 500, color: 'rgba(255,255,255,0.72)', textDecoration: 'none', borderBottom: '1px solid var(--rule)' }}>
                List Your Business
              </Link>
              <div style={{ padding: '16px 28px' }}>
                <Link href="/login" style={{
                  display: 'block', padding: '13px',
                  background: 'var(--gold)', borderRadius: 'var(--radius-md)',
                  fontSize: 15, fontWeight: 700, textDecoration: 'none',
                  color: 'var(--forest)', textAlign: 'center',
                }}>
                  Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .d1921-nav-desktop { display: none !important; }
          .d1921-nav-mobile  { display: flex !important; }
        }
        @media (min-width: 769px) {
          .d1921-nav-mobile  { display: none !important; }
          .d1921-nav-desktop { display: flex !important; }
        }
      `}</style>
    </>
  )
}
