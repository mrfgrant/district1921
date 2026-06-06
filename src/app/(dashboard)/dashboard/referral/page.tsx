import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReferralDashboard } from '@/components/dashboard/ReferralDashboard'

export const metadata = { title: 'Referrals — Dashboard' }

export default async function ReferralPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('referral_code, referral_credits_cents, email').eq('id', user.id).single()

  const { data: referrals } = await supabase
    .from('referrals').select('*').eq('referrer_id', user.id).order('created_at', { ascending: false })

  return <ReferralDashboard profile={profile} referrals={referrals ?? []} />
}
