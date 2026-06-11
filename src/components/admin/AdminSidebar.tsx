'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { UserRole } from '@/types'

const navItems = [
  { href: '/admin',              label: 'Overview',          roles: ['admin', 'moderator'] },
  { href: '/admin/listings',     label: 'Listings Queue',    roles: ['admin', 'moderator'] },
  { href: '/admin/shield-queue', label: 'Shield Queue',      roles: ['admin'] },
  { href: '/admin/reports',      label: 'Reports',           roles: ['admin', 'moderator'] },
  { href: '/admin/spotlight',    label: 'Spotlight',         roles: ['admin'] },
  { href: '/admin/sponsors',     label: 'Sponsors',          roles: ['admin'] },
  { href: '/admin/ads',          label: 'Ad Approvals',      roles: ['admin'] },
  { href: '/admin/users',        label: 'Users',             roles: ['admin'] },
  { href: '/admin/import',       label: 'Import Businesses', roles: ['admin'] },
  { href: '/admin/batch-scrape', label: 'Batch Scrape',      roles: ['admin'] },
]

export function AdminSidebar({ role }: { role: UserRole }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const visible = navItems.filter(i => i.roles.includes(role))
  const currentLabel = visible.find(i => i.href === pathname)?.label ?? 'Admin'

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="d1921-admin-mobile w-full bg-[var(--color-charcoal)] border-b border-[var(--color-border)] px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-display text-base text-[var(--color-gold)]">
          District 1921
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-3 py-1.5"
          aria-expanded={open}
        >
          <span>{currentLabel}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M18 15l-6-6-6 6"/> : <path d="M6 9l6 6 6-6"/>}
          </svg>
        </button>
      </div>

      {/* ── Mobile dropdown ── */}
      {open && (
        <div className="d1921-admin-mobile fixed inset-x-0 top-[49px] z-50 bg-[var(--color-charcoal)] border-b border-[var(--color-border)] shadow-xl">
          {visible.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                'block px-5 py-3 text-sm border-b border-[var(--color-border)] transition-colors',
                pathname === item.href
                  ? 'text-[var(--color-gold)] font-semibold bg-[var(--color-surface)]'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}

      {/* ── Desktop sidebar ── */}
      <aside className="d1921-admin-desktop w-56 bg-[var(--color-charcoal)] border-r border-[var(--color-border)] flex flex-col py-6 shrink-0">
        <Link href="/" className="px-6 mb-2">
          <span className="font-display text-lg text-[var(--color-gold)]">District 1921</span>
        </Link>
        <p className="px-6 mb-6 text-xs text-[var(--color-muted)] uppercase tracking-widest">{role}</p>
        <nav className="flex-1 px-3">
          {visible.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block px-3 py-2 rounded text-sm mb-1 transition-colors',
                pathname === item.href
                  ? 'bg-[var(--color-gold)] text-[var(--color-midnight)] font-semibold'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .d1921-admin-desktop { display: none !important; }
          .d1921-admin-mobile  { display: flex !important; }
        }
        @media (min-width: 769px) {
          .d1921-admin-mobile  { display: none !important; }
          .d1921-admin-desktop { display: flex !important; }
        }
      `}</style>
    </>
  )
}
