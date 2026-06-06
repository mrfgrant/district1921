import { HeroSearch } from '@/components/search/HeroSearch'
import { SpotlightFeature } from '@/components/community/SpotlightFeature'
import { CategoryGrid } from '@/components/business/CategoryGrid'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = createClient()

  const { data: spotlight } = await supabase
    .from('spotlights')
    .select('*, business:businesses(*)')
    .order('week_of', { ascending: false })
    .limit(1)
    .single()

  return (
    <div>
      <HeroSearch />
      {spotlight && <SpotlightFeature spotlight={spotlight} />}
      <CategoryGrid />
    </div>
  )
}
