import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sign in to check in' }, { status: 401 })

  const { businessId } = await req.json()
  const admin = createAdminClient()

  await admin.from('checkins').insert({ business_id: businessId, user_id: user.id })
  await admin.rpc('increment_checkin_count', { biz_id: businessId })

  return NextResponse.json({ ok: true })
}
