export const dynamic = 'force-dynamic'

import { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { CATEGORY_LABELS, BusinessCategory } from '@/types'

const BASE = 'https://district1921.com'

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const admin = createAdminClient()

  // Static pages
  const statics: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/search`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE}/deals`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/events`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/jobs`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE}/requests`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE}/preview`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
  ]

  // Business profile pages
  const { data: businesses } = await admin
    .from('businesses')
    .select('slug, updated_at')
    .eq('status', 'active')
    .order('updated_at', { ascending: false })
    .limit(5000)

  const bizPages: MetadataRoute.Sitemap = (businesses ?? []).map(b => ({
    url: `${BASE}/business/${b.slug}`,
    lastModified: new Date(b.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // City + category SEO pages
  const { data: cityData } = await admin
    .from('businesses')
    .select('category, city, state, updated_at')
    .eq('status', 'active')
    .not('city', 'is', null)
    .not('state', 'is', null)

  const seenCityPages = new Set<string>()
  const seoPages: MetadataRoute.Sitemap = []

  for (const row of cityData ?? []) {
    const key = `${row.category}-${row.city}-${row.state}`
    if (!seenCityPages.has(key)) {
      seenCityPages.add(key)
      seoPages.push({
        url: `${BASE}/${row.category}-${slugify(row.city)}-${row.state.toLowerCase()}`,
        lastModified: new Date(row.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })
    }
  }

  return [...statics, ...bizPages, ...seoPages]
}
