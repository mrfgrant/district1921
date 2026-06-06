'use client'
import { useEffect, useState } from 'react'
import { SidebarAd, SearchBannerAd, HouseSidebarAd, HouseSearchBannerAd } from './AdPlacements'

export function AdSlot({ placement, city, state }: {
  placement: 'sidebar' | 'search_banner'
  city?: string
  state?: string
}) {
  const [ad, setAd] = useState<any>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams({ placement })
    if (city) params.set('city', city)
    if (state) params.set('state', state)

    fetch(`/api/ads/serve?${params}`)
      .then(r => r.json())
      .then(data => {
        setAd(data.ad)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [placement, city, state])

  if (!loaded) return null

  const slug = ad?.businesses?.slug ?? ad?.business_slug ?? ''

  if (placement === 'sidebar') {
    return ad && slug
      ? <SidebarAd ad={ad} businessSlug={slug} />
      : <HouseSidebarAd />
  }

  if (placement === 'search_banner') {
    return ad && slug
      ? <SearchBannerAd ad={ad} businessSlug={slug} />
      : <HouseSearchBannerAd />
  }

  return null
}
