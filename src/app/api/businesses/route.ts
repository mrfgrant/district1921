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
  const {
    name, category, slug, honor_pledge,
    is_mobile_service, address, city, state, zip,
    phone, website, email,
    description, hours,
  } = body

  if (!name || !category || !city || !state) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (!honor_pledge) {
    return NextResponse.json({ error: 'Honor pledge is required' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Ensure slug uniqueness
  let finalSlug = slug
  const { data: existing } = await admin
    .from('businesses')
    .select('id')
    .eq('slug', finalSlug)
    .single()

  if (existing) {
    finalSlug = slug + '-' + Math.random().toString(36).slice(2, 6)
  }

  const { data: business, error } = await admin
    .from('businesses')
    .insert({
      owner_id: user.id,
      slug: finalSlug,
      name: name.trim(),
      category,
      status: 'pending',
      subscription_status: 'none',
      honor_pledge,
      is_mobile_service: is_mobile_service ?? false,
      address: address?.trim() || null,
      city: city.trim(),
      state: state.toUpperCase(),
      zip: zip?.trim() || null,
      phone: phone?.trim() || null,
      website: website?.trim() || null,
      email: email?.trim() || null,
      description: description?.trim() || null,
      hours: hours || null,
      profile_completion: 30,
    })
    .select('id, slug')
    .single()

  if (error) {
    console.error('Business insert error:', error)
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
  }

  // Upgrade role to free_owner
  await admin.from('profiles').update({ role: 'free_owner' }).eq('id', user.id)

  // Send confirmation email via Resend
  try {
    await sendBusinessSubmitted(user.email!, name.trim())
  } catch (emailErr) {
    // Don't fail the request if email fails — business is already saved
    console.error('Business submitted email error:', emailErr)
  }

  return NextResponse.json({ id: business.id, slug: business.slug })
}
