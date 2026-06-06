import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { businessId, eventType } = await req.json()
  const admin = createAdminClient()
  await admin.from('analytics_events').insert({ business_id: businessId, event_type: eventType, metadata: {} })
  return NextResponse.json({ ok: true })
}
