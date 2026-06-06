import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BillingPanel } from '@/components/dashboard/BillingPanel'

export const metadata = { title: 'Billing — Dashboard' }

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { success?: string; canceled?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, subscription_status, gold_shield, stripe_customer_id')
    .eq('owner_id', user.id)
    .single()

  if (!business) redirect('/onboarding')

  return (
    <BillingPanel
      business={business}
      userEmail={user.email!}
      justUpgraded={searchParams.success === 'subscription'}
      justPaidShield={searchParams.success === 'shield'}
    />
  )
}
