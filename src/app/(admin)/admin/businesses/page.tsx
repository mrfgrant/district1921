import { createClient } from '@/lib/supabase/server'
import { AdminBusinessManager } from '@/components/admin/AdminBusinessManager'

export const metadata = { title: 'Businesses — Admin' }

export default async function AdminBusinessesPage() {
  const supabase = createClient()

  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, slug, category, city, state, status, subscription_status, gold_shield, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  return <AdminBusinessManager businesses={businesses ?? []} />
}
