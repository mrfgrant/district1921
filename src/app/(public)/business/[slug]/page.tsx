import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { BusinessProfile } from '@/components/business/BusinessProfile'
import { CATEGORY_LABELS, BusinessCategory } from '@/types'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { data: biz } = await supabase
    .from('businesses')
    .select('name, city, state, category, description, gold_shield, logo_url, rating_avg')
    .eq('slug', params.slug)
    .eq('status', 'active')
    .single()

  if (!biz) return { title: 'Business Not Found' }

  const category = CATEGORY_LABELS[biz.category as BusinessCategory] ?? biz.category

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://district1921.com'
  const ogParams = new URLSearchParams({
    name: biz.name,
    city: biz.city ?? '',
    state: biz.state ?? '',
    category: biz.category ?? '',
    gold: biz.gold_shield ? '1' : '0',
    ...(biz.logo_url ? { logo: biz.logo_url } : {}),
    ...(biz.rating_avg ? { rating: String(biz.rating_avg) } : {}),
  })
  const ogImage = `${baseUrl}/api/og?${ogParams.toString()}`

  return {
    title: `${biz.name} — District 1921`,
    description: biz.description ?? `${biz.name} in ${biz.city}, ${biz.state} — District 1921 Community Business Directory`,
    openGraph: {
      title: biz.name,
      description: biz.description ?? `${biz.name} · ${biz.city}, ${biz.state}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: biz.name }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: biz.name,
      description: biz.description ?? `${biz.name} · ${biz.city}, ${biz.state}`,
      images: [ogImage],
    },
  }
}

export default async function BusinessPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()

  const { data: biz } = await supabase
    .from('businesses')
    .select(`
      id, name, slug, category, status, subscription_status,
      city, state, address, suite, zip, phone, website, email,
      description, hours, photos, logo_url, cover_photo_url,
      is_mobile_service, gold_shield, honor_pledge,
      rating_avg, rating_count, checkin_count, follow_count,
      external_rating_url, created_at, owner_id,
      social_facebook, social_instagram, social_twitter, social_linkedin, social_youtube, social_tiktok
    `)
    .eq('slug', params.slug)
    .eq('status', 'active')
    .single()

  if (!biz) notFound()

  // Log a view analytics event (fire and forget)
  supabase.from('analytics_events').insert({
    business_id: biz.id,
    event_type: 'view',
    metadata: {},
  }).then(() => {})

  // Get active deals and events (paid only)
  const isPaid = biz.subscription_status === 'active'

  const [{ data: deals }, { data: events }] = await Promise.all([
    isPaid ? supabase
      .from('deals')
      .select('*')
      .eq('business_id', biz.id)
      .or('expires_at.is.null,expires_at.gt.now()')
      .order('created_at', { ascending: false })
      .limit(3)
      : { data: null },
    isPaid ? supabase
      .from('events')
      .select('*')
      .eq('business_id', biz.id)
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(3)
      : { data: null },
  ])

  return (
    <BusinessProfile
      business={biz}
      deals={deals ?? []}
      events={events ?? []}
      isPaid={isPaid}
    />
  )
}
