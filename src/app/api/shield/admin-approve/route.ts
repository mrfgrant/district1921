import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { applicationId, businessId, action, notes } = await req.json()
  const admin = createAdminClient()

  if (action === 'approve') {
    await admin.from('shield_applications').update({
      status: 'approved',
      reviewer_id: user.id,
      reviewer_notes: notes || null,
      reviewed_at: new Date().toISOString(),
    }).eq('id', applicationId)

    await admin.from('businesses').update({
      gold_shield: true,
      shield_approved_at: new Date().toISOString(),
      shield_approved_by: user.id,
    }).eq('id', businessId)
  } else {
    await admin.from('shield_applications').update({
      status: 'rejected',
      reviewer_id: user.id,
      reviewer_notes: notes || null,
      reviewed_at: new Date().toISOString(),
    }).eq('id', applicationId)
  }

  return NextResponse.json({ ok: true })
}
