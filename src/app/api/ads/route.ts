import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: business } = await supabase
    .from('businesses')
    .select('id, subscription_status, city, state')
    .eq('owner_id', user.id)
    .single()

  if (!business || business.subscription_status !== 'active') {
    return NextResponse.json({ error: 'Professional Page required' }, { status: 403 })
  }

  const body = await req.json()
  const { headline, body: adBody, cta_text, image_url, placement, targeting, target_city, target_state, daily_budget_cents, starts_at, ends_at } = body

  if (!headline || !adBody || !placement) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Default targeting to owner's city/state
  const finalCity = targeting === 'local' ? (target_city || business.city) : target_city
  const finalState = targeting === 'nationwide' ? null : (target_state || business.state)

  const admin = createAdminClient()
  const { data: ad, error } = await admin
    .from('ads')
    .insert({
      business_id: business.id,
      owner_id: user.id,
      headline: headline.trim(),
      body: adBody.trim(),
      cta_text: cta_text?.trim() || 'Learn More',
      image_url: image_url || null,
      placement,
      targeting: targeting || 'local',
      target_city: finalCity || null,
      target_state: finalState || null,
      daily_budget_cents: daily_budget_cents || 500,
      status: 'pending',
      starts_at: starts_at || null,
      ends_at: ends_at || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Ad insert error:', error)
    return NextResponse.json({ error: 'Failed to create ad' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, ad })
}

export async function PATCH(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { adId, action } = await req.json()
  const admin = createAdminClient()

  // Verify ownership
  const { data: ad } = await admin.from('ads').select('owner_id').eq('id', adId).single()
  if (!ad || ad.owner_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const newStatus = action === 'pause' ? 'paused' : action === 'resume' ? 'active' : null
  if (!newStatus) return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  // Can only pause/resume if currently active or paused
  await admin.from('ads').update({ status: newStatus }).eq('id', adId)

  return NextResponse.json({ ok: true })
}
