'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { UserRole } from '@/types'

const navItems = [
  { href: '/admin', label: 'Overview', roles: ['admin', 'moderator'] },
  { href: '/admin/listings', label: 'Listings Queue', roles: ['admin', 'moderator'] },
  { href: '/admin/shield-queue', label: 'Shield Queue', roles: ['admin'] },
  { href: '/admin/reports', label: 'Reports', roles: ['admin', 'moderator'] },
  { href: '/admin/spotlight', label: 'Spotlight', roles: ['admin'] },
  { href: '/admin/ads', label: 'Ad Approvals', roles: ['admin'] },
  { href: '/admin/categories', label: 'Categories', roles: ['admin'] },
  { href: '/admin/users', label: 'Users', roles: ['admin'] },
]

export function AdminSidebar({ role }: { role: UserRole }) {
  const pathname = usePathname()
  const visible = navItems.filter(i => i.roles.includes(role))

  return (
    <aside className="w-56 bg-[var(--color-charcoal)] border-r border-[var(--color-border)] flex flex-col py-6">
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
  )
}
