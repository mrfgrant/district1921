import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata = { title: 'Admin — District 1921' }

export default async function AdminPage() {
  const supabase = createClient()

  const [
    { count: pending },
    { count: pendingAds },
    { count: active },
    { count: suspended },
    { count: users },
    { count: shieldPending },
    { count: reports },
  ] = await Promise.all([
    supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('status', 'suspended'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('shield_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('resolved', false),
    supabase.from('ads').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const stats = [
    { label: 'Pending Review', value: pending ?? 0, href: '/admin/listings?status=pending', urgent: (pending ?? 0) > 0, color: '#c9a84c' },
    { label: 'Active Listings', value: active ?? 0, href: '/admin/listings?status=active', urgent: false, color: '#2d6a4f' },
    { label: 'Suspended', value: suspended ?? 0, href: '/admin/listings?status=suspended', urgent: false, color: '#6b7280' },
    { label: 'Shield Queue', value: shieldPending ?? 0, href: '/admin/shield-queue', urgent: (shieldPending ?? 0) > 0, color: '#c9a84c' },
    { label: 'Open Reports', value: reports ?? 0, href: '/admin/reports', urgent: (reports ?? 0) > 0, color: '#c62828' },
    { label: 'Total Users', value: users ?? 0, href: '/admin/users', urgent: false, color: '#1a3a2a' },
    { label: 'Pending Ads', value: pendingAds ?? 0, href: '/admin/ads', urgent: (pendingAds ?? 0) > 0, color: '#c9a84c' },
  ]

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-3xl text-[var(--color-gold)] mb-2">Admin Panel</h1>
      <p className="text-[var(--color-text-secondary)] text-sm mb-8">District 1921 — internal dashboard</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        {stats.map(s => (
          <Link key={s.label} href={s.href}
            className="block bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 hover:border-[var(--color-gold)] transition-colors group">
            <div className="text-3xl font-bold mb-1" style={{ color: s.urgent ? s.color : 'var(--color-text)' }}>
              {s.value}
              {s.urgent && s.value > 0 && <span className="ml-2 text-sm">●</span>}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">{s.label}</div>
          </Link>
        ))}
      </div>

      {(pending ?? 0) > 0 && (
        <div className="bg-[var(--color-surface)] border border-[#c9a84c] rounded-xl p-5 mb-6">
          <p className="text-[var(--color-gold)] font-semibold mb-1">
            ⚠️ {pending} listing{(pending ?? 0) > 1 ? 's' : ''} waiting for review
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] mb-3">
            Community members are waiting for their businesses to go live.
          </p>
          <Link href="/admin/listings?status=pending"
            className="inline-block px-4 py-2 bg-[var(--color-gold)] text-[var(--color-midnight)] text-sm font-semibold rounded">
            Review Now →
          </Link>
        </div>
      )}
    </div>
  )
}
