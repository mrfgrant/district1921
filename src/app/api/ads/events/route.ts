import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { adId, eventType } = await req.json()
    if (!adId || !eventType) return NextResponse.json({ ok: true })

    const admin = createAdminClient()
    await admin.from('ad_events').insert({ ad_id: adId, event_type: eventType })

    // Increment aggregate counters
    if (eventType === 'impression') {
      await admin.rpc('increment_ad_impressions', { ad_id: adId })
    } else if (eventType === 'click') {
      await admin.rpc('increment_ad_clicks', { ad_id: adId })
    }
  } catch (e) {
    // Non-blocking — never fail a page load for an ad event
    console.error('Ad event error:', e)
  }

  return NextResponse.json({ ok: true })
}
