import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { submitted?: string; success?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, status, subscription_status, gold_shield, profile_completion, city, state, category, slug')
    .eq('owner_id', user.id)
    .single()

  // No business yet — send to onboarding
  if (!business) redirect('/onboarding')

  const justSubmitted = searchParams.submitted === '1'
  const justUpgraded = searchParams.success === 'subscription'

  return (
    <div className="max-w-4xl">
      {/* Just submitted banner */}
      {justSubmitted && (
        <div className="bg-[#d8f3dc] border border-[#b8e0c4] border-l-4 border-l-[#2d6a4f] rounded-xl px-6 py-4 mb-8">
          <p className="font-semibold text-[#1a3a2a] mb-1">🎉 Your listing is under review</p>
          <p className="text-sm text-[#2d6a4f]">
            We'll approve it within 24–48 hours and email you when it's live. In the meantime, you can complete your profile below.
          </p>
        </div>
      )}

      {/* Upgraded banner */}
      {justUpgraded && (
        <div className="bg-[#f5e6c0] border border-[#e8d090] border-l-4 border-l-[#c9a84c] rounded-xl px-6 py-4 mb-8">
          <p className="font-semibold text-[#3a2e10] mb-1">⭐ Welcome to Professional</p>
          <p className="text-sm text-[#5a4a20]">
            Your page is now unlocked. Upload your logo, add photos, and complete your profile to attract more customers.
          </p>
        </div>
      )}

      {/* Business header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl text-[var(--color-gold)] mb-1">{business.name}</h1>
          <p className="text-[var(--color-text-secondary)] text-sm">{business.city}, {business.state}</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <StatusBadge status={business.status} />
          {business.subscription_status === 'active' && (
            <span className="px-3 py-1 bg-[#c9a84c] text-[#1a3a2a] text-xs font-bold rounded-full">PRO</span>
          )}
          {business.gold_shield && (
            <span className="px-3 py-1 bg-[#1a3a2a] text-[#c9a84c] text-xs font-bold rounded-full">🛡 Gold Shield</span>
          )}
        </div>
      </div>

      {/* Profile completion */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-[var(--color-text)]">Profile Completion</span>
          <span className="text-2xl font-bold text-[var(--color-gold)]">{business.profile_completion}%</span>
        </div>
        <div className="h-2 bg-[var(--color-border)] rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-[var(--color-gold)] rounded-full transition-all"
            style={{ width: `${business.profile_completion}%` }}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {business.subscription_status !== 'active' && (
            <Link href="/dashboard/billing" className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] transition-colors">
              <span className="text-base">⬆️</span> Upgrade to Pro
            </Link>
          )}
          <Link href="/dashboard/profile" className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] transition-colors">
            <span className="text-base">📸</span> Add photos & logo
          </Link>
          <Link href="/dashboard/shield" className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] transition-colors">
            <span className="text-base">🛡</span> Get Gold Shield
          </Link>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Views', value: '—' },
          { label: 'Check-ins', value: '—' },
          { label: 'Followers', value: '—' },
          { label: 'Shares', value: '—' },
        ].map(stat => (
          <div key={stat.label} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[var(--color-gold)] mb-1">{stat.value}</div>
            <div className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Pending state message */}
      {business.status === 'pending' && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 text-center">
          <div className="text-3xl mb-3">⏳</div>
          <p className="font-semibold text-[var(--color-text)] mb-2">Your listing is being reviewed</p>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Our team will review your submission within 24–48 hours. You'll receive an email when it goes live.
          </p>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending:   { label: 'Under Review', className: 'bg-yellow-900/30 text-yellow-400 border-yellow-800' },
    active:    { label: 'Active',       className: 'bg-green-900/30 text-green-400 border-green-800' },
    suspended: { label: 'Suspended',    className: 'bg-red-900/30 text-red-400 border-red-800' },
    rejected:  { label: 'Rejected',     className: 'bg-red-900/30 text-red-400 border-red-800' },
  }
  const s = map[status] ?? map.pending
  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${s.className}`}>
      {s.label}
    </span>
  )
}
