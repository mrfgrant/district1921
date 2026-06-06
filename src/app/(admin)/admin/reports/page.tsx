import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Reports — Admin' }

export default async function ReportsPage() {
  const supabase = createClient()

  const { data: reports } = await supabase
    .from('reports')
    .select('*, business:businesses(name, slug)')
    .eq('resolved', false)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-2xl text-[var(--color-gold)] mb-6">Open Reports</h1>

      {!reports?.length ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">✓</div>
          <p className="font-semibold text-[var(--color-text)]">No open reports</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map(r => (
            <div key={r.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-[var(--color-text)] mb-1">{(r.business as any)?.name}</p>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-1"><strong>Reason:</strong> {r.reason}</p>
                  {r.details && <p className="text-sm text-[var(--color-text-secondary)]">{r.details}</p>}
                </div>
                <span className="text-xs text-[var(--color-text-secondary)] flex-shrink-0">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
