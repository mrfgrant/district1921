import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendMonthlySummary } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const monthEnd = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const period = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const { data: businesses } = await admin
    .from('businesses')
    .select('id, name, owner_id, profiles!owner_id(email)')
    .eq('status', 'active')
    .eq('subscription_status', 'active')

  if (!businesses?.length) return NextResponse.json({ ok: true, sent: 0 })

  let sent = 0
  for (const biz of businesses) {
    const owner = (biz as any).profiles
    if (!owner?.email) continue

    const { data: events } = await admin
      .from('analytics_events').select('event_type')
      .eq('business_id', biz.id).gte('created_at', monthStart).lt('created_at', monthEnd)

    const stats = {
      views: events?.filter(e => e.event_type === 'view').length ?? 0,
      checkins: events?.filter(e => e.event_type === 'checkin').length ?? 0,
      follows: events?.filter(e => e.event_type === 'follow').length ?? 0,
      shares: events?.filter(e => e.event_type === 'share').length ?? 0,
      clicks: events?.filter(e => ['phone_click','website_click','directions_click'].includes(e.event_type)).length ?? 0,
    }

    try {
      await sendMonthlySummary({
        to: owner.email, businessName: biz.name, period, stats,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/analytics`,
      })
      sent++
    } catch (e) { console.error(`Failed to send to ${owner.email}:`, e) }
  }

  return NextResponse.json({ ok: true, sent, total: businesses.length })
}
