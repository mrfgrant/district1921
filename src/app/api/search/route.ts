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
  const nationwide = searchParams.get('nationwide') === 'true'
  const limit    = Math.min(parseInt(searchParams.get('limit') ?? '24'), 50)
  const offset   = parseInt(searchParams.get('offset') ?? '0')

  const supabase = createAdminClient()

  // Base conditions always applied
  const base: string[] = [`status = 'active'`]

  if (q) base.push(`(name ilike '%${esc(q)}%' or description ilike '%${esc(q)}%')`)
  if (category) base.push(`category = '${esc(category)}'`)
  if (shield) base.push(`gold_shield = true`)
  if (mobile) base.push(`is_mobile_service = true`)

  let whereClause: string

  if (city || state) {
    // Location-based search:
    // Always include nationwide + online businesses (they serve everywhere)
    // Plus local/statewide businesses matching the city/state
    const localConditions = [...base]
    if (city) localConditions.push(`city ilike '%${esc(city)}%'`)
    if (state) localConditions.push(`state = '${esc(state).toUpperCase()}'`)

    const stateConditions = [...base, `service_area = 'statewide'`]
    if (state) stateConditions.push(`state = '${esc(state).toUpperCase()}'`)

    const broadConditions = [...base, `service_area in ('nationwide', 'online')`]

    whereClause = `(
      (${localConditions.join(' and ')})
      or (${stateConditions.join(' and ')})
      or (${broadConditions.join(' and ')})
    )`
  } else {
    // No location filter — return everything (or nationwide/online if filter selected)
    whereClause = base.join(' and ')
  }

  const { data, error } = await supabase.rpc('search_businesses', {
    where_clause: whereClause,
    lim: limit,
    off: offset,
  })

  if (error) {
    console.error('Search RPC error:', error)
    // Fallback without coordinates
    const { data: fallback, count } = await supabase
      .from('businesses')
      .select('id,name,slug,category,status,subscription_status,city,state,address,is_mobile_service,service_area,logo_url,description,hours,gold_shield,rating_avg,rating_count,checkin_count,created_at', { count: 'exact' })
      .eq('status', 'active')
      .order('subscription_status', { ascending: false })
      .order('gold_shield', { ascending: false })
      .range(offset, offset + limit - 1)

    let results = (fallback ?? []).map((b: any) => ({ ...b, lat: null, lng: null }))
    if (openNow) results = filterOpenNow(results)
    return NextResponse.json({ results, count: count ?? 0 })
  }

  let results = data ?? []
  if (openNow) results = filterOpenNow(results)

  return NextResponse.json({ results, count: results.length })
}

function esc(s: string) {
  return s.replace(/'/g, "''")
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
