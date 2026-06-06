'use client'
import Link from 'next/link'

export function SiteHeader() {
  // mobile menu — TODO

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-charcoal)] border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-xl font-bold text-[var(--color-gold)]">
            District 1921
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/search" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors">
            Search
          </Link>
          <Link href="/deals" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors">
            Deals
          </Link>
          <Link href="/events" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors">
            Events
          </Link>
          <Link href="/jobs" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors">
            Jobs
          </Link>
          <Link href="/requests" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors">
            Requests
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 bg-[var(--color-gold)] text-[var(--color-midnight)] rounded text-sm font-semibold hover:bg-[var(--color-gold-light)] transition-colors"
          >
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  )
}
