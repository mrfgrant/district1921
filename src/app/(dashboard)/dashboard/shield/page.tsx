import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GoldShieldApply } from '@/components/dashboard/GoldShieldApply'

export const metadata = { title: 'Gold Shield — Dashboard' }

export default async function ShieldPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, phone, website, state, subscription_status, gold_shield, website_reachable, phone_verified, proof_photo_url')
    .eq('owner_id', user.id).single()

  if (!business) redirect('/onboarding')
  if (business.subscription_status !== 'active') redirect('/dashboard/billing')

  const { data: application } = await supabase
    .from('shield_applications')
    .select('*')
    .eq('business_id', business.id)
    .single()

  return <GoldShieldApply business={business} application={application} />
}
