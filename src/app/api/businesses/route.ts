import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendBusinessSubmitted } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, category, slug, honor_pledge, is_mobile_service, address, suite, city, state, zip, phone, website, email, description, hours } = body

  if (!name || !category || !city || !state) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (!honor_pledge) {
    return NextResponse.json({ error: 'Honor pledge is required' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Check if user is admin
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

  // Ensure slug uniqueness
  let finalSlug = slug
  const { data: existing } = await admin.from('businesses').select('id').eq('slug', finalSlug).single()
  if (existing) finalSlug = slug + '-' + Math.random().toString(36).slice(2, 6)

  // Admins go live immediately, everyone else is pending
  const status = isAdmin ? 'active' : 'pending'
  // Admins get paid features without subscription
  const subscription_status = isAdmin ? 'active' : 'none'

  const { data: business, error } = await admin
    .from('businesses')
    .insert({
      owner_id: user.id,
      slug: finalSlug,
      name: name.trim(),
      category,
      status,
      subscription_status,
      honor_pledge,
      is_mobile_service: is_mobile_service ?? false,
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
      profile_completion: isAdmin ? 60 : 30,
    })
    .select('id, slug')
    .single()

  if (error) {
    console.error('Business insert error:', error)
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
  }

  // Set role
  await admin.from('profiles').update({ role: isAdmin ? 'admin' : 'free_owner' }).eq('id', user.id)

  // Send email (non-blocking)
  try {
    await sendBusinessSubmitted(user.email!, name.trim())
  } catch (e) {
    console.error('Email error:', e)
  }

  return NextResponse.json({ id: business.id, slug: business.slug })
}
