import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'

export const metadata = { title: 'Set Up Your Business' }

export default async function OnboardingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/onboarding')

  const { data: existing } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (existing) redirect('/dashboard')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  return <OnboardingFlow userId={user.id} userEmail={user.email!} isAdmin={isAdmin} />
}
