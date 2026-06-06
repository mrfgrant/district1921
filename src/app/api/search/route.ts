import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

  // Use admin client + raw SQL for PostGIS coordinate extraction
  const supabase = createAdminClient()

  let conditions = [`status = 'active'`]
  if (q) conditions.push(`(name ilike '%${q.replace(/'/g,"''")}%' or description ilike '%${q.replace(/'/g,"''")}%')`)
  if (city) conditions.push(`city ilike '%${city.replace(/'/g,"''")}%'`)
  if (state) conditions.push(`state = '${state.toUpperCase().replace(/'/g,"''")}'`)
  if (category) conditions.push(`category = '${category.replace(/'/g,"''")}' `)
  if (shield) conditions.push(`gold_shield = true`)
  if (mobile) conditions.push(`is_mobile_service = true`)

  const where = conditions.join(' and ')

  const { data, error } = await supabase.rpc('search_businesses', {
    where_clause: where,
    lim: limit,
    off: offset,
  })

  if (error) {
    // Fallback to standard query without coordinates
    const { data: fallback, count } = await supabase
      .from('businesses')
      .select('id,name,slug,category,status,subscription_status,city,state,address,is_mobile_service,logo_url,description,hours,gold_shield,rating_avg,rating_count,checkin_count,created_at', { count: 'exact' })
      .eq('status', 'active')
      .order('subscription_status', { ascending: false })
      .order('gold_shield', { ascending: false })
      .range(offset, offset + limit - 1)

    let results = (fallback ?? []).map((b: any) => ({ ...b, lat: null, lng: null }))
    if (openNow) results = filterOpenNow(results)
    return NextResponse.json({ results, count: count ?? 0 })
  }

  let results = (data ?? [])
  if (openNow) results = filterOpenNow(results)
  return NextResponse.json({ results, count: results.length })
}

function filterOpenNow(results: any[]) {
  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
  const today = days[new Date().getDay()]
  const cur = new Date().getHours() * 60 + new Date().getMinutes()
  return results.filter((biz: any) => {
    const h = biz.hours?.[today]
    if (!h || h.closed) return false
    const [oh,om] = h.open.split(':').map(Number)
    const [ch,cm] = h.close.split(':').map(Number)
    return cur >= oh*60+om && cur < ch*60+cm
  })
}
