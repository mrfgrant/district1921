import { createClient } from '@/lib/supabase/server'
import { AdminBusinessManager } from '@/components/admin/AdminBusinessManager'

export const metadata = { title: 'Businesses — Admin' }

export default async function AdminBusinessesPage() {
  const supabase = createClient()

  const { data: businesses } = await supabase
    .from('businesses')
    .select(`
      id, name, slug, category, city, state, zip,
      address, suite, status, subscription_status,
      gold_shield, honor_pledge, created_at,
      description, phone, website, email,
      logo_url, cover_photo_url, photos,
      is_mobile_service, service_area, hours,
      social_facebook, social_instagram, social_twitter,
      social_linkedin, social_youtube, social_tiktok,
      external_rating_url
    `)
    .order('created_at', { ascending: false })
    .limit(200)

  return <AdminBusinessManager businesses={businesses ?? []} />
}
