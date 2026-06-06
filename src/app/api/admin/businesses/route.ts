import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { geocodeAddress } from '@/lib/maps/geocode'

export const dynamic = 'force-dynamic'

// Fields allowed in the businesses table
const ALLOWED_UPDATE_FIELDS = new Set([
  'name','category','description','phone','website','email',
  'address','suite','city','state','zip',
  'service_area','is_mobile_service',
  'logo_url','cover_photo_url','photos',
  'hours','gold_shield','honor_pledge',
  'subscription_status','status',
  'external_rating_url',
  'social_facebook','social_instagram','social_twitter','social_linkedin','social_youtube','social_tiktok',
])

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
    logo_url, cover_photo_url, photos,
    hours, gold_shield, honor_pledge,
    subscription_status,
  } = body

  if (!name || !category || !city || !state) {
    return NextResponse.json({ error: 'Name, category, city and state are required' }, { status: 400 })
  }

  const admin = createAdminClient()

  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const slug = `${base}-${Math.random().toString(36).slice(2, 6)}`

  let locationPoint = null
  if (address && city && state) {
    const coords = await geocodeAddress(address, city, state, zip)
    if (coords) locationPoint = `POINT(${coords.lng} ${coords.lat})`
  }

  const { data: business, error } = await admin
    .from('businesses')
    .insert({
      owner_id: user.id,
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
      logo_url: logo_url || null,
      cover_photo_url: cover_photo_url || null,
      photos: photos || [],
      profile_completion: 70,
      ...(locationPoint ? { location: locationPoint } : {}),
    })
    .select('id, slug, name')
    .single()

  if (error) {
    console.error('Admin business create error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create business' }, { status: 500 })
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

  // Strip any UI-only or unknown fields before sending to DB
  const safeUpdates: Record<string, any> = {}
  for (const [key, val] of Object.entries(updates || {})) {
    if (ALLOWED_UPDATE_FIELDS.has(key)) {
      safeUpdates[key] = val
    }
  }

  // Normalize state to uppercase
  if (safeUpdates.state) safeUpdates.state = String(safeUpdates.state).toUpperCase()
  // Ensure hours is null not false when not included
  if ('hours' in safeUpdates && !safeUpdates.hours) safeUpdates.hours = null

  safeUpdates.updated_at = new Date().toISOString()

  const admin = createAdminClient()
  const { error } = await admin
    .from('businesses')
    .update(safeUpdates)
    .eq('id', businessId)

  if (error) {
    console.error('Admin business update error:', error)
    return NextResponse.json({ error: error.message || 'Update failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
