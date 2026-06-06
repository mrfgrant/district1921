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

  const { businessId, blurb, sendBlast } = await req.json()
  const admin = createAdminClient()

  const weekOf = new Date().toISOString().split('T')[0]
  await admin.from('spotlights').upsert({ business_id: businessId, blurb, week_of: weekOf }, { onConflict: 'week_of' })

  if (sendBlast) {
    // Get business details and all user emails
    const [{ data: biz }, { data: users }] = await Promise.all([
      admin.from('businesses').select('name, slug, logo_url').eq('id', businessId).single(),
      admin.from('profiles').select('email'),
    ])

    const { sendSpotlightBlast } = await import('@/lib/email')
    const emails = (users ?? []).map(u => u.email).filter(Boolean)

    // Send in batches of 50
    const batch = emails.slice(0, 50)
    await Promise.allSettled(batch.map(email =>
      sendSpotlightBlast({ to: email, businessName: biz!.name, businessSlug: biz!.slug, blurb, logoUrl: biz!.logo_url ?? undefined })
    ))
  }

  return NextResponse.json({ ok: true })
}
