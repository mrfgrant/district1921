import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { BusinessProfile } from '@/components/business/BusinessProfile'
import { CATEGORY_LABELS, BusinessCategory } from '@/types'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { data: biz } = await supabase
    .from('businesses')
    .select('name, city, state, category, description')
    .eq('slug', params.slug)
    .eq('status', 'active')
    .single()

  if (!biz) return { title: 'Business Not Found' }

  const category = CATEGORY_LABELS[biz.category as BusinessCategory] ?? biz.category

  return {
    title: `${biz.name} — ${category} in ${biz.city}, ${biz.state} | District 1921`,
    description: biz.description?.slice(0, 160) ?? `${biz.name} is a community business in ${biz.city}, ${biz.state}.`,
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
      external_rating_url, created_at, owner_id
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
