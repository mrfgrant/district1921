import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CATEGORY_LABELS, BusinessCategory } from '@/types'

export const metadata = { title: 'Category Sponsors — Admin' }

export default async function SponsorsPage() {
  const supabase = createClient()
  const { data: sponsors } = await supabase
    .from('category_sponsors')
    .select('*, business:businesses(name, slug, logo_url)')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-[var(--color-gold)]">Category Sponsors</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">Businesses paying for category page sponsorship placement</p>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-8 text-center mb-6">
        <p className="text-3xl mb-3">🏆</p>
        <p className="font-semibold text-[var(--color-text)] mb-2">Category sponsorships active</p>
        <p className="text-sm text-[var(--color-text-secondary)]">Sponsors appear at the top of their chosen category pages with a "Sponsored by" label. Pricing: $99–299/mo.</p>
      </div>

      {(sponsors?.length ?? 0) === 0 ? (
        <div className="text-center py-8 text-[var(--color-text-secondary)] text-sm">No active sponsors yet.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {(sponsors ?? []).map((s: any) => (
            <div key={s.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex items-center gap-4">
              <div style={{ width: 40, height: 40, borderRadius: 8, background: s.business?.logo_url ? `url(${s.business.logo_url}) center/cover` : '#2A2A35', flexShrink: 0 }} />
              <div className="flex-1">
                <div className="font-semibold text-[var(--color-text)]">{s.business?.name}</div>
                <div className="text-xs text-[var(--color-text-secondary)]">
                  {CATEGORY_LABELS[s.category as BusinessCategory] ?? s.category}
                  {s.state ? ` · ${s.state}` : ' · Nationwide'}
                  {' · '} ${(s.amount_cents / 100).toFixed(0)}/mo
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: s.status === 'active' ? 'rgba(45,106,79,0.2)' : 'rgba(107,114,128,0.2)', color: s.status === 'active' ? '#4CAF74' : '#9CA3AF' }}>
                {s.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
