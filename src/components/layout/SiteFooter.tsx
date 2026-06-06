import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="bg-[var(--color-charcoal)] border-t border-[var(--color-border)] py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <p className="font-display text-lg text-[var(--color-gold)] mb-4">District 1921</p>
            <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
              Discover and support community businesses across all 50 states.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-3">Directory</p>
            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              <li><Link href="/search" className="hover:text-[var(--color-gold)]">Search</Link></li>
              <li><Link href="/near-me" className="hover:text-[var(--color-gold)]">Near Me</Link></li>
              <li><Link href="/deals" className="hover:text-[var(--color-gold)]">Deals</Link></li>
              <li><Link href="/events" className="hover:text-[var(--color-gold)]">Events</Link></li>
              <li><Link href="/jobs" className="hover:text-[var(--color-gold)]">Job Board</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-3">Owners</p>
            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              <li><Link href="/dashboard" className="hover:text-[var(--color-gold)]">Dashboard</Link></li>
              <li><Link href="/dashboard/profile" className="hover:text-[var(--color-gold)]">Add Listing</Link></li>
              <li><Link href="/dashboard/billing" className="hover:text-[var(--color-gold)]">Upgrade</Link></li>
              <li><Link href="/dashboard/shield" className="hover:text-[var(--color-gold)]">Gold Shield</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-3">Community</p>
            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              <li><Link href="/requests" className="hover:text-[var(--color-gold)]">Request Board</Link></li>
              <li><Link href="/spotlight" className="hover:text-[var(--color-gold)]">Spotlight</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[var(--color-border)] pt-6 text-center text-xs text-[var(--color-muted)]">
          © {new Date().getFullYear()} District 1921. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
