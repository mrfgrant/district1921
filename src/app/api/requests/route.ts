import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sign in to post a request' }, { status: 401 })

  const { title, description, category, city, state } = await req.json()
  if (!title || !description || !city || !state) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('community_requests')
    .insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim(),
      category: category || null,
      city: city.trim(),
      state: state.toUpperCase(),
      is_open: true,
    })
    .select()
    .single()

  if (error) {
    console.error('Request insert error:', error)
    return NextResponse.json({ error: 'Failed to post request' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, request: data })
}
