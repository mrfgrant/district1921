import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { ClaimFlow } from '@/components/claim/ClaimFlow'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  return { title: `Claim ${params.slug.replace(/-/g, ' ')} — District 1921` }
}

export default async function ClaimPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()

  // Must be signed in
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/claim/${params.slug}`)

  // Fetch the business
  const { data: biz } = await supabase
    .from('businesses')
    .select('id, name, slug, category, city, state, address, phone, website, owner_id, gold_shield, subscription_status')
    .eq('slug', params.slug)
    .single()

  if (!biz) notFound()

  // Already claimed by this user — send to dashboard
  if (biz.owner_id === user.id) redirect('/dashboard')

  // Already claimed by someone else — send to the business page
  if (biz.owner_id && biz.owner_id !== user.id) redirect(`/business/${params.slug}`)

  return <ClaimFlow business={biz} userId={user.id} />
}
