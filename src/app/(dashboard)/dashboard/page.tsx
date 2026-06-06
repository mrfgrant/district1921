import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!business) {
    redirect('/dashboard/profile?onboarding=1')
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--color-gold)] mb-8">
        {business.name}
      </h1>
      <p className="text-[var(--color-text-secondary)]">
        Dashboard overview — analytics, quick actions, and profile completion here.
      </p>
    </div>
  )
}
