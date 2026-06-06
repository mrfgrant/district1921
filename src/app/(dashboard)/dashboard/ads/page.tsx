import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdsManager } from '@/components/ads/AdsManager'

export const metadata = { title: 'Ads — Dashboard' }

export default async function AdsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, subscription_status, city, state')
    .eq('owner_id', user.id)
    .single()

  if (!business) redirect('/onboarding')
  if (business.subscription_status !== 'active') redirect('/dashboard/billing')

  const { data: ads } = await supabase
    .from('ads')
    .select('*')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })

  return (
    <AdsManager
      business={business}
      ads={ads ?? []}
    />
  )
}
