import { createClient } from '@/lib/supabase/server'
import { CATEGORY_LABELS, BusinessCategory } from '@/types'
import { RequestsBoard } from '@/components/requests/RequestsBoard'

export const metadata = {
  title: 'Community Request Board — District 1921',
  description: 'Post a need, get matched to verified community businesses. Looking for a plumber, caterer, or stylist? Ask the community.',
}

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: { category?: string; state?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get user's business if they're a paid owner
  let userBusiness = null
  if (user) {
    const { data } = await supabase
      .from('businesses')
      .select('id, name, category, city, state, subscription_status, slug')
      .eq('owner_id', user.id)
      .single()
    if (data?.subscription_status === 'active') userBusiness = data
  }

  let query = supabase
    .from('community_requests')
    .select(`
      id, title, description, category, city, state,
      is_open, reply_count, created_at,
      user:profiles!user_id(email)
    `)
    .eq('is_open', true)
    .order('created_at', { ascending: false })
    .limit(50)

  if (searchParams.category) query = query.eq('category', searchParams.category)
  if (searchParams.state) query = query.eq('state', searchParams.state.toUpperCase())

  const { data: requests } = await query

  // Get replies for requests (only visible to paid owners)
  let repliesByRequest: Record<string, any[]> = {}
  if (userBusiness && requests?.length) {
    const { data: replies } = await supabase
      .from('community_replies')
      .select('*, business:businesses(name, slug)')
      .in('request_id', requests.map(r => r.id))
    if (replies) {
      for (const reply of replies) {
        if (!repliesByRequest[reply.request_id]) repliesByRequest[reply.request_id] = []
        repliesByRequest[reply.request_id].push(reply)
      }
    }
  }

  return (
    <RequestsBoard
      requests={requests ?? []}
      repliesByRequest={repliesByRequest}
      user={user ? { id: user.id, email: user.email! } : null}
      userBusiness={userBusiness}
      currentCategory={searchParams.category}
      currentState={searchParams.state}
    />
  )
}
