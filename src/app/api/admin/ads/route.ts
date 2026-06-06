import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { adId, action, reason } = await req.json()
  const admin = createAdminClient()

  const newStatus = action === 'approve' ? 'active' : action === 'reject' ? 'rejected' : null
  if (!newStatus) return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  await admin.from('ads').update({
    status: newStatus,
    ...(reason ? { rejection_reason: reason } : {}),
    ...(newStatus === 'active' ? { starts_at: new Date().toISOString() } : {}),
  }).eq('id', adId)

  return NextResponse.json({ ok: true })
}
