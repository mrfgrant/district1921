import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CompetitorInsight } from '@/components/dashboard/CompetitorInsight'

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
    .select(`
      id, name, status, subscription_status, gold_shield, profile_completion,
      city, state, category, slug,
      description, phone, website, email, address, is_mobile_service,
      logo_url, cover_photo_url, photos, hours, external_rating_url,
      social_instagram, social_facebook, social_twitter,
      social_linkedin, social_youtube, social_tiktok
    `)
    .eq('owner_id', user.id)
    .single()

  if (!business) redirect('/onboarding')

  const justSubmitted = searchParams.submitted === '1'
  const justUpgraded  = searchParams.success === 'subscription'
  const isPro         = business.subscription_status === 'active'
  const score         = business.profile_completion ?? 0

  // Build dynamic improvement prompts based on what is missing
  const prompts: { icon: string; label: string; href: string }[] = []

  if (!isPro)
    prompts.push({ icon: '⭐', label: 'Upgrade to Pro (+10 features)', href: '/dashboard/billing' })
  if (!business.description || business.description.length < 20)
    prompts.push({ icon: '✏️', label: 'Write a description (+15 pts)', href: '/dashboard/profile' })
  if (!business.logo_url)
    prompts.push({ icon: '🖼', label: 'Upload your logo (+10 pts)', href: '/dashboard/profile' })
  if (!business.phone)
    prompts.push({ icon: '📞', label: 'Add your phone number (+10 pts)', href: '/dashboard/profile' })
  if (!business.website)
    prompts.push({ icon: '🌐', label: 'Add your website (+10 pts)', href: '/dashboard/profile' })
  if (!business.cover_photo_url)
    prompts.push({ icon: '📸', label: 'Upload a cover photo (+5 pts)', href: '/dashboard/profile' })
  if (!business.photos || (business.photos as string[]).length === 0)
    prompts.push({ icon: '🖼', label: 'Add gallery photos (+5 pts)', href: '/dashboard/profile' })
  if (!business.email)
    prompts.push({ icon: '✉️', label: 'Add your email (+5 pts)', href: '/dashboard/profile' })
  if (!business.hours || Object.keys(business.hours ?? {}).length === 0)
    prompts.push({ icon: '🕐', label: 'Set your hours (+5 pts)', href: '/dashboard/profile' })
  if (!business.gold_shield)
    prompts.push({ icon: '🛡', label: 'Apply for Gold Shield (+10 pts)', href: '/dashboard/shield' })
  if (!business.social_instagram && !business.social_facebook && !business.social_twitter &&
      !business.social_linkedin && !business.social_youtube && !business.social_tiktok)
    prompts.push({ icon: '📱', label: 'Add a social link (+5 pts)', href: '/dashboard/profile' })
  if (!business.external_rating_url)
    prompts.push({ icon: '⭐', label: 'Link your Google/Yelp reviews (+5 pts)', href: '/dashboard/profile' })

  // Show at most 4 prompts at a time
  const visiblePrompts = prompts.slice(0, 4)

  // Score color
  const scoreColor = score >= 80 ? '#40916c' : score >= 50 ? '#c9a84c' : '#e74c3c'
  const scoreLabel = score >= 80 ? 'Looking great!' : score >= 50 ? 'Good progress' : 'Just getting started'

  return (
    <div className="max-w-4xl">
      {justSubmitted && (
        <div className="bg-[#d8f3dc] border border-[#b8e0c4] border-l-4 border-l-[#2d6a4f] rounded-xl px-6 py-4 mb-8">
          <p className="font-semibold text-[#1a3a2a] mb-1">Your listing is under review</p>
          <p className="text-sm text-[#2d6a4f]">
            We'll approve it within 24-48 hours and email you when it's live. In the meantime, complete your profile below.
          </p>
        </div>
      )}

      {justUpgraded && (
        <div className="bg-[#f5e6c0] border border-[#e8d090] border-l-4 border-l-[#c9a84c] rounded-xl px-6 py-4 mb-8">
          <p className="font-semibold text-[#3a2e10] mb-1">Welcome to Professional</p>
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
          {isPro && (
            <span className="px-3 py-1 bg-[#c9a84c] text-[#1a3a2a] text-xs font-bold rounded-full">PRO</span>
          )}
          {business.gold_shield && (
            <span className="px-3 py-1 bg-[#1a3a2a] text-[#c9a84c] text-xs font-bold rounded-full">Gold Shield</span>
          )}
        </div>
      </div>

      {/* Profile completion */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-sm font-semibold text-[var(--color-text)]">Profile Completion</span>
            <span className="text-xs text-[var(--color-text-secondary)] ml-2">{scoreLabel}</span>
          </div>
          <span className="text-2xl font-bold" style={{ color: scoreColor }}>{score}%</span>
        </div>
        <div className="h-2.5 bg-[var(--color-border)] rounded-full overflow-hidden mb-5">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${score}%`, backgroundColor: scoreColor }}
          />
        </div>

        {visiblePrompts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {visiblePrompts.map(p => (
              <Link
                key={p.label}
                href={p.href}
                className="flex items-center gap-2.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] transition-colors bg-[var(--color-bg)] rounded-lg px-3 py-2.5 border border-[var(--color-border)] hover:border-[var(--color-gold)]"
              >
                <span className="text-base shrink-0">{p.icon}</span>
                <span>{p.label}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#40916c] font-medium">Your profile is complete!</p>
        )}

        {prompts.length > 4 && (
          <p className="text-xs text-[var(--color-text-secondary)] mt-3">
            +{prompts.length - 4} more improvements available in your profile
          </p>
        )}
      </div>

      {/* Competitor proximity */}
      <CompetitorInsight />

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Views',     value: '—' },
          { label: 'Check-ins', value: '—' },
          { label: 'Followers', value: '—' },
          { label: 'Shares',    value: '—' },
        ].map(stat => (
          <div key={stat.label} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[var(--color-gold)] mb-1">{stat.value}</div>
            <div className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Pending state */}
      {business.status === 'pending' && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 text-center">
          <div className="text-3xl mb-3">⏳</div>
          <p className="font-semibold text-[var(--color-text)] mb-2">Your listing is being reviewed</p>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Our team will review your submission within 24-48 hours. You'll receive an email when it goes live.
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
