import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOwnerOutreach } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { suggestionId, businessName, businessCity, ownerEmail, suggesterEmail } = await req.json()
  if (!ownerEmail || !businessName) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  await sendOwnerOutreach({ to: ownerEmail, businessName, businessCity, suggesterEmail })

  const admin = createAdminClient()
  await admin.from('preregistrations')
    .update({ notified_at: new Date().toISOString() })
    .eq('id', suggestionId)

  return NextResponse.json({ ok: true })
}
