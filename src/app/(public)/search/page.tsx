import { SearchResults } from '@/components/search/SearchResults'
import { SearchFilters } from '@/components/search/SearchFilters'
import { BusinessMap } from '@/components/map/BusinessMap'

export const metadata = { title: 'Search Businesses' }

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; city?: string; state?: string; category?: string }
}) {
  return (
    <div className="flex flex-col lg:flex-row gap-0 h-[calc(100vh-64px)]">
      <div className="w-full lg:w-[420px] flex flex-col border-r border-[var(--color-border)]">
        <SearchFilters params={searchParams} />
        <SearchResults params={searchParams} />
      </div>
      <div className="flex-1">
        <BusinessMap params={searchParams} />
      </div>
    </div>
  )
}
