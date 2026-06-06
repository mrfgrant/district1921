import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'

export const metadata = { title: 'Set Up Your Business' }

export default async function OnboardingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // If they already have a business, go to dashboard
  const { data: existing } = await supabase
    .from('businesses')
    .select('id, status')
    .eq('owner_id', user.id)
    .single()

  if (existing) redirect('/dashboard')

  return <OnboardingFlow userId={user.id} userEmail={user.email!} />
}
