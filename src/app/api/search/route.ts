import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q        = searchParams.get('q')?.trim() ?? ''
  const city     = searchParams.get('city')?.trim() ?? ''
  const state    = searchParams.get('state')?.trim() ?? ''
  const category = searchParams.get('category') ?? ''
  const shield   = searchParams.get('shield') === 'true'
  const openNow  = searchParams.get('open') === 'true'
  const mobile   = searchParams.get('mobile') === 'true'
  const limit    = Math.min(parseInt(searchParams.get('limit') ?? '24'), 50)
  const offset   = parseInt(searchParams.get('offset') ?? '0')

  const supabase = createClient()

  let query = supabase
    .from('businesses')
    .select(`
      id, name, slug, category, status, subscription_status,
      city, state, address, is_mobile_service,
      logo_url, description, hours,
      gold_shield, rating_avg, rating_count, checkin_count,
      created_at,
      location
    `, { count: 'exact' })
    .eq('status', 'active')
    .order('subscription_status', { ascending: false })
    .order('gold_shield', { ascending: false })
    .order('rating_avg', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1)

  if (q) query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`)
  if (city) query = query.ilike('city', `%${city}%`)
  if (state) query = query.eq('state', state.toUpperCase())
  if (category) query = query.eq('category', category)
  if (shield) query = query.eq('gold_shield', true)
  if (mobile) query = query.eq('is_mobile_service', true)

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: 'Search failed' }, { status: 500 })

  let results = data ?? []

  // Parse PostGIS geometry to lat/lng
  results = results.map((biz: any) => {
    let lat = null, lng = null
    if (biz.location) {
      // PostGIS returns WKB hex — extract from coordinates string if available
      // Supabase returns geometry as GeoJSON when using the REST API with proper headers
      if (typeof biz.location === 'object' && biz.location.coordinates) {
        lng = biz.location.coordinates[0]
        lat = biz.location.coordinates[1]
      }
    }
    return { ...biz, lat, lng }
  })

  if (openNow) {
    const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
    const today = days[new Date().getDay()]
    const cur = new Date().getHours() * 60 + new Date().getMinutes()
    results = results.filter((biz: any) => {
      const h = biz.hours?.[today]
      if (!h || h.closed) return false
      const [oh,om] = h.open.split(':').map(Number)
      const [ch,cm] = h.close.split(':').map(Number)
      return cur >= oh*60+om && cur < ch*60+cm
    })
  }

  return NextResponse.json({ results, count: count ?? 0 })
}
