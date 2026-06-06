import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Analytics — Dashboard' }

export default async function AnalyticsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('owner_id', user.id)
    .single()

  if (!business) redirect('/onboarding')

  // Last 30 days analytics
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data: events } = await supabase
    .from('analytics_events')
    .select('event_type, created_at')
    .eq('business_id', business.id)
    .gte('created_at', thirtyDaysAgo)
    .order('created_at', { ascending: false })

  const counts: Record<string, number> = {}
  for (const ev of events ?? []) {
    counts[ev.event_type] = (counts[ev.event_type] ?? 0) + 1
  }

  const stats = [
    { label: 'Page Views', key: 'view', icon: '👁' },
    { label: 'Phone Clicks', key: 'phone_click', icon: '📞' },
    { label: 'Website Clicks', key: 'website_click', icon: '🌐' },
    { label: 'Direction Clicks', key: 'directions_click', icon: '📍' },
    { label: 'Shares', key: 'share', icon: '↗' },
    { label: 'Check-ins', key: 'checkin', icon: '✓' },
  ]

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl text-[var(--color-gold)] mb-1">{business.name}</h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-8">Last 30 days</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.key} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold text-[var(--color-text)] mb-1">{(counts[s.key] ?? 0).toLocaleString()}</div>
            <div className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">{s.label}</div>
          </div>
        ))}
      </div>

      {(events?.length ?? 0) === 0 && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-8 text-center">
          <p className="text-3xl mb-3">📊</p>
          <p className="font-semibold text-[var(--color-text)] mb-1">No activity yet</p>
          <p className="text-sm text-[var(--color-text-secondary)]">Analytics will appear once your listing is live and getting visitors.</p>
        </div>
      )}
    </div>
  )
}
