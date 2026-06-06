import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Shield Queue — Admin' }

export default async function ShieldQueuePage() {
  const supabase = createClient()

  const { data: apps } = await supabase
    .from('shield_applications')
    .select('*, business:businesses(name, city, state, category, owner_id, owner:profiles!owner_id(email))')
    .eq('status', 'pending')
    .order('submitted_at', { ascending: true })

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-2xl text-[var(--color-gold)] mb-2">Gold Shield Queue</h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-6">Review proof photos and approve or reject Gold Shield applications.</p>

      {!apps?.length ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">🛡</div>
          <p className="font-semibold text-[var(--color-text)]">No pending applications</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {apps.map(app => (
            <div key={app.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-semibold text-[var(--color-text)] mb-1">{(app.business as any)?.name}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {(app.business as any)?.city}, {(app.business as any)?.state} · {(app.business as any)?.owner?.email}
                  </p>
                </div>
                <span className="text-xs text-[var(--color-text-secondary)]">
                  {new Date(app.submitted_at).toLocaleDateString()}
                </span>
              </div>
              {app.proof_photo_url && (
                <a href={app.proof_photo_url} target="_blank" rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-[var(--color-midnight)] border border-[var(--color-border)] rounded text-sm text-[var(--color-gold)] hover:border-[var(--color-gold)] transition-colors">
                  View Proof Photo ↗
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
