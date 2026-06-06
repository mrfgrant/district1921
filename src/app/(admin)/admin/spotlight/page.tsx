import { createClient } from '@/lib/supabase/server'
import { SpotlightPicker } from '@/components/admin/SpotlightPicker'

export const metadata = { title: 'Spotlight — Admin' }

export default async function AdminSpotlightPage() {
  const supabase = createClient()

  const [{ data: businesses }, { data: current }] = await Promise.all([
    supabase.from('businesses').select('id, name, slug, city, state, logo_url, gold_shield, category')
      .eq('status', 'active').order('gold_shield', { ascending: false }).limit(100),
    supabase.from('spotlights').select('*, business:businesses(name, slug)')
      .order('week_of', { ascending: false }).limit(1).single(),
  ])

  return <SpotlightPicker businesses={businesses ?? []} current={current} />
}
