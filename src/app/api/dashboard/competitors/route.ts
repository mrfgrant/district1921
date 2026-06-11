import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: business } = await supabase
    .from('businesses')
    .select('id, location')
    .eq('owner_id', user.id)
    .single()

  if (!business) return NextResponse.json({ error: 'No business' }, { status: 404 })
  if (!business.location) return NextResponse.json({ competitors: [], no_location: true })

  const { data: competitors, error } = await supabase
    .rpc('nearby_competitors', { biz_id: business.id, radius_miles: 5 })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ competitors: competitors ?? [] })
}
