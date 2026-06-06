import { createClient } from '@/lib/supabase/server'
import { ListingsQueue } from '@/components/admin/ListingsQueue'

export const metadata = { title: 'Listings Queue — Admin' }

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const supabase = createClient()
  const status = searchParams.status ?? 'pending'

  const { data: businesses } = await supabase
    .from('businesses')
    .select(`
      id, name, slug, category, status, subscription_status,
      city, state, address, phone, website, description,
      honor_pledge, is_mobile_service, gold_shield,
      created_at, owner_id,
      owner:profiles!owner_id(email, role)
    `)
    .eq('status', status)
    .order('created_at', { ascending: true })

  return <ListingsQueue businesses={businesses ?? []} currentStatus={status} />
}
