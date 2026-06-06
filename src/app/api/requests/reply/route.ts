import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: business } = await supabase
    .from('businesses')
    .select('id, subscription_status')
    .eq('owner_id', user.id)
    .single()

  if (!business || business.subscription_status !== 'active') {
    return NextResponse.json({ error: 'Professional Page required to reply' }, { status: 403 })
  }

  const { requestId, message } = await req.json()
  if (!requestId || !message?.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('community_replies')
    .insert({ request_id: requestId, business_id: business.id, message: message.trim() })

  if (error) return NextResponse.json({ error: 'Failed to post reply' }, { status: 500 })

  await admin.rpc('increment_reply_count', { req_id: requestId })

  return NextResponse.json({ ok: true })
}
