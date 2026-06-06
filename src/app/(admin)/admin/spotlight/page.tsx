import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata = { title: 'Spotlight — Admin' }

export default async function AdminSpotlightPage() {
  const supabase = createClient()
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, slug, city, state, gold_shield')
    .eq('status', 'active')
    .order('gold_shield', { ascending: false })
    .limit(50)

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl text-[var(--color-gold)] mb-2">Weekly Spotlight</h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-6">Pick one business to feature on the spotlight page and in the weekly email blast.</p>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-8 text-center">
        <p className="text-3xl mb-3">🌟</p>
        <p className="font-semibold text-[var(--color-text)] mb-2">Spotlight picker coming soon</p>
        <p className="text-sm text-[var(--color-text-secondary)]">This is Phase 2 Task #20. The spotlight page is live at <Link href="/spotlight" className="text-[var(--color-gold)] underline">/spotlight</Link> and will show the chosen business once selected.</p>
      </div>
    </div>
  )
}
