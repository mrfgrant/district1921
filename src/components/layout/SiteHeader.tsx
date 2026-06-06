'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string>('user')
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user)
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        if (profile) setRole(profile.role)
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
    { href: '/search', label: 'Search' },
    { href: '/deals', label: 'Deals' },
    { href: '/events', label: 'Events' },
    { href: '/jobs', label: 'Jobs' },
    { href: '/requests', label: 'Requests' },
  ]

  const isAdmin = role === 'admin'
  const isOwner = ['free_owner', 'paid_owner', 'admin'].includes(role)

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: '#1a3a2a',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.2)',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: '#c9a84c', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🏛</div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 900, color: '#fff' }}>
              District <span style={{ color: '#c9a84c' }}>1921</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hidden-mobile">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} style={{
                padding: '6px 12px', borderRadius: 6,
                fontSize: 13, fontWeight: 500, textDecoration: 'none',
                color: pathname === l.href ? '#fff' : 'rgba(255,255,255,0.7)',
                background: pathname === l.href ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'all 0.15s',
              }}>
                {l.label}
              </Link>
            ))}

            {/* Divider */}
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)', margin: '0 8px' }} />

            {user ? (
              <>
                {isOwner && (
                  <Link href="/dashboard" style={{ padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500, textDecoration: 'none', color: 'rgba(255,255,255,0.7)', transition: 'color 0.15s' }}>
                    Dashboard
                  </Link>
                )}
                {isAdmin && (
                  <Link href="/admin" style={{ padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500, textDecoration: 'none', color: '#c9a84c', transition: 'color 0.15s' }}>
                    Admin
                  </Link>
                )}
                <button onClick={handleSignOut} style={{
                  padding: '7px 16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 6, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.8)',
                  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                }}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login?next=/onboarding" style={{ padding: '7px 14px', borderRadius: 6, fontSize: 13, fontWeight: 500, textDecoration: 'none', color: 'rgba(255,255,255,0.7)' }}>
                  List Your Business
                </Link>
                <Link href="/login" style={{
                  padding: '7px 16px', background: '#c9a84c', borderRadius: 6,
                  fontSize: 13, fontWeight: 700, textDecoration: 'none', color: '#1a3a2a',
                }}>
                  Sign In
                </Link>
              </>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="show-mobile"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: '#fff', fontSize: 20 }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', top: 64, left: 0, right: 0, bottom: 0,
          background: '#1a3a2a', zIndex: 40,
          overflowY: 'auto', padding: '16px 0',
        }}>
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} style={{
              display: 'block', padding: '14px 24px', fontSize: 16, fontWeight: 500,
              color: 'rgba(255,255,255,0.85)', textDecoration: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              {l.label}
            </Link>
          ))}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.12)', margin: '8px 0' }} />
          {user ? (
            <>
              {isOwner && (
                <Link href="/dashboard" style={{ display: 'block', padding: '14px 24px', fontSize: 16, fontWeight: 500, color: 'rgba(255,255,255,0.85)', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link href="/admin" style={{ display: 'block', padding: '14px 24px', fontSize: 16, fontWeight: 600, color: '#c9a84c', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  Admin Panel
                </Link>
              )}
              <button onClick={handleSignOut} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '14px 24px', fontSize: 16, fontWeight: 500, color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login?next=/onboarding" style={{ display: 'block', padding: '14px 24px', fontSize: 16, fontWeight: 500, color: 'rgba(255,255,255,0.85)', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                List Your Business
              </Link>
              <div style={{ padding: '16px 24px' }}>
                <Link href="/login" style={{ display: 'block', padding: '14px', background: '#c9a84c', borderRadius: 8, fontSize: 15, fontWeight: 700, textDecoration: 'none', color: '#1a3a2a', textAlign: 'center' }}>
                  Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
          .hidden-mobile { display: flex !important; }
        }
      `}</style>
    </>
  )
}
