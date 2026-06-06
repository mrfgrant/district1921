'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/profile', label: 'Profile' },
  { href: '/dashboard/analytics', label: 'Analytics' },
  { href: '/dashboard/events', label: 'Events' },
  { href: '/dashboard/deals', label: 'Deals' },
  { href: '/dashboard/jobs', label: 'Jobs' },
  { href: '/dashboard/requests', label: 'Community Requests' },
  { href: '/dashboard/boost', label: 'Boost Listing' },
  { href: '/dashboard/shield', label: 'Gold Shield' },
  { href: '/dashboard/billing', label: 'Billing' },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-56 bg-[var(--color-charcoal)] border-r border-[var(--color-border)] flex flex-col py-6">
      <Link href="/" className="px-6 mb-6">
        <span className="font-display text-lg text-[var(--color-gold)]">District 1921</span>
      </Link>
      <nav className="flex-1 px-3">
        {navItems.map(item => (
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
  )
}
