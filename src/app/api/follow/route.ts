import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sign in to follow' }, { status: 401 })

  const { businessId } = await req.json()
  const admin = createAdminClient()

  const { data: existing } = await admin
    .from('follows')
    .select('id')
    .eq('business_id', businessId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    await admin.from('follows').delete().eq('id', existing.id)
    await admin.from('businesses').update({ follow_count: admin.rpc('greatest', { a: 0, b: -1 }) }).eq('id', businessId)
  } else {
    await admin.from('follows').insert({ business_id: businessId, user_id: user.id })
    await admin.from('businesses').update({ follow_count: (admin as any).sql`follow_count + 1` }).eq('id', businessId)
  }

  return NextResponse.json({ ok: true, following: !existing })
}
