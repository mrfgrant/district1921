import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const placement = searchParams.get('placement') ?? 'sidebar'
  const city = searchParams.get('city') ?? ''
  const state = searchParams.get('state') ?? ''

  const admin = createAdminClient()

  // Try to find a local ad first, then statewide, then nationwide
  let ad = null

  if (city && state) {
    const { data } = await admin
      .from('ads')
      .select('id,business_id,headline,body,cta_text,image_url,placement,targeting,businesses!business_id(slug)')
      .eq('status', 'active')
      .eq('placement', placement)
      .eq('targeting', 'local')
      .ilike('target_city', `%${city}%`)
      .eq('target_state', state.toUpperCase())
      .limit(1)
    ad = data?.[0] ?? null
  }

  if (!ad && state) {
    const { data } = await admin
      .from('ads')
      .select('id,business_id,headline,body,cta_text,image_url,placement,targeting,businesses!business_id(slug)')
      .eq('status', 'active')
      .eq('placement', placement)
      .eq('targeting', 'statewide')
      .eq('target_state', state.toUpperCase())
      .limit(1)
    ad = data?.[0] ?? null
  }

  if (!ad) {
    const { data } = await admin
      .from('ads')
      .select('id,business_id,headline,body,cta_text,image_url,placement,targeting,businesses!business_id(slug)')
      .eq('status', 'active')
      .eq('placement', placement)
      .eq('targeting', 'nationwide')
      .limit(1)
    ad = data?.[0] ?? null
  }

  return NextResponse.json({ ad: ad ?? null })
}
