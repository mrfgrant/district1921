import { createClient } from '@/lib/supabase/server'
import { AdminAdsQueue } from '@/components/admin/AdminAdsQueue'

export const metadata = { title: 'Ad Queue — Admin' }

export default async function AdminAdsPage() {
  const supabase = createClient()
  const { data: ads } = await supabase
    .from('ads')
    .select('*, business:businesses!business_id(name, slug, city, state), owner:profiles!owner_id(email)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  return <AdminAdsQueue ads={ads ?? []} />
}
