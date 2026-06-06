import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendBusinessApproved } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  if (!['admin', 'moderator'].includes(profile?.role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { businessId, action, reason } = await req.json()
  if (!businessId || !action) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const admin = createAdminClient()

  const newStatus = action === 'approve' ? 'active'
    : action === 'reject' ? 'rejected'
    : action === 'suspend' ? 'suspended'
    : null

  if (!newStatus) return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  const { data: business, error } = await admin
    .from('businesses')
    .update({ status: newStatus })
    .eq('id', businessId)
    .select('name, slug, owner_id, owner:profiles!owner_id(email)')
    .single()

  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

  // Send approval email
  if (action === 'approve') {
    const ownerEmail = (business.owner as any)?.email
    if (ownerEmail) {
      try {
        await sendBusinessApproved(ownerEmail, business.name, business.slug)
      } catch (e) {
        console.error('Approval email error:', e)
      }
    }
  }

  return NextResponse.json({ ok: true, status: newStatus })
}
