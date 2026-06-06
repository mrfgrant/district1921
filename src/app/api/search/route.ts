import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q         = searchParams.get('q')?.trim() ?? ''
  const city      = searchParams.get('city')?.trim() ?? ''
  const state     = searchParams.get('state')?.trim() ?? ''
  const category  = searchParams.get('category') ?? ''
  const shield    = searchParams.get('shield') === 'true'
  const openNow   = searchParams.get('open') === 'true'
  const mobile    = searchParams.get('mobile') === 'true'
  const limit     = Math.min(parseInt(searchParams.get('limit') ?? '24'), 50)
  const offset    = parseInt(searchParams.get('offset') ?? '0')

  const supabase = createClient()

  let query = supabase
    .from('businesses')
    .select(`
      id, name, slug, category, status, subscription_status,
      city, state, address, is_mobile_service,
      logo_url, description, hours,
      gold_shield, rating_avg, rating_count, checkin_count,
      created_at
    `, { count: 'exact' })
    .eq('status', 'active')
    .order('subscription_status', { ascending: false }) // pro pages first
    .order('gold_shield', { ascending: false })
    .order('rating_avg', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1)

  if (q) {
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`)
  }
  if (city) {
    query = query.ilike('city', `%${city}%`)
  }
  if (state) {
    query = query.eq('state', state.toUpperCase())
  }
  if (category) {
    query = query.eq('category', category)
  }
  if (shield) {
    query = query.eq('gold_shield', true)
  }
  if (mobile) {
    query = query.eq('is_mobile_service', true)
  }

  const { data, count, error } = await query

  if (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }

  // Filter open now client-side (hours are JSON)
  let results = data ?? []
  if (openNow) {
    const now = new Date()
    const dayIdx = now.getDay()
    const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
    const today = days[dayIdx]
    const currentMins = now.getHours() * 60 + now.getMinutes()

    results = results.filter(biz => {
      const h = biz.hours?.[today]
      if (!h || h.closed) return false
      const [oh, om] = h.open.split(':').map(Number)
      const [ch, cm] = h.close.split(':').map(Number)
      return currentMins >= oh * 60 + om && currentMins < ch * 60 + cm
    })
  }

  return NextResponse.json({ results, count: count ?? 0 })
}
