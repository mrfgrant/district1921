import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { geocodeAddress } from '@/lib/maps/geocode'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const {
    name, category, description, phone, website, email,
    address, suite, city, state, zip,
    service_area, is_mobile_service,
    hours, gold_shield, honor_pledge,
    subscription_status,
  } = body

  if (!name || !category || !city || !state) {
    return NextResponse.json({ error: 'Name, category, city and state are required' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Generate unique slug
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const suffix = Math.random().toString(36).slice(2, 6)
  const slug = `${base}-${suffix}`

  // Geocode address
  let locationPoint = null
  if (address && city && state) {
    const coords = await geocodeAddress(address, city, state, zip)
    if (coords) locationPoint = `POINT(${coords.lng} ${coords.lat})`
  }

  const { data: business, error } = await admin
    .from('businesses')
    .insert({
      owner_id: user.id, // admin owns it until transferred
      slug,
      name: name.trim(),
      category,
      status: 'active',
      subscription_status: subscription_status ?? 'active',
      honor_pledge: honor_pledge ?? true,
      is_mobile_service: is_mobile_service ?? false,
      service_area: service_area ?? 'local',
      address: address?.trim() || null,
      suite: suite?.trim() || null,
      city: city.trim(),
      state: state.toUpperCase(),
      zip: zip?.trim() || null,
      phone: phone?.trim() || null,
      website: website?.trim() || null,
      email: email?.trim() || null,
      description: description?.trim() || null,
      hours: hours || null,
      gold_shield: gold_shield ?? false,
      profile_completion: 70,
      ...(locationPoint ? { location: locationPoint } : {}),
    })
    .select('id, slug, name')
    .single()

  if (error) {
    console.error('Admin business create error:', error)
    return NextResponse.json({ error: 'Failed to create business' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, business })
}

export async function PATCH(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { businessId, updates } = await req.json()
  if (!businessId) return NextResponse.json({ error: 'Missing businessId' }, { status: 400 })

  const admin = createAdminClient()

  const { error } = await admin
    .from('businesses')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', businessId)

  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

  return NextResponse.json({ ok: true })
}
