import { Suspense } from 'react'
import { SearchPage } from '@/components/search/SearchPage'

export const metadata = {
  title: 'Search Businesses — District 1921',
  description: 'Search and discover community businesses across all 50 states.',
}

export default function Search() {
  return (
    <Suspense>
      <SearchPage />
    </Suspense>
  )
}
