import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    name, description, phone, website, email,
    address, suite, city, state, zip,
    hours, is_mobile_service, service_area,
    logo_url, cover_photo_url, photos,
  } = body

  // Compute profile completion score
  const fields = { logo_url, description, phone, website, email, address, hours, photos }
  const filled = Object.values(fields).filter(v => v && (Array.isArray(v) ? v.length > 0 : true)).length
  const profile_completion = Math.round((filled / Object.keys(fields).length) * 100)

  const admin = createAdminClient()

  const { error } = await admin
    .from('businesses')
    .update({
      name: name?.trim(),
      description: description?.trim() || null,
      phone: phone?.trim() || null,
      website: website?.trim() || null,
      email: email?.trim() || null,
      address: address?.trim() || null,
      suite: suite?.trim() || null,
      city: city?.trim(),
      state: state?.toUpperCase(),
      zip: zip?.trim() || null,
      hours: hours || null,
      is_mobile_service: is_mobile_service ?? false,
      service_area: service_area ?? 'local',
      logo_url: logo_url || null,
      cover_photo_url: cover_photo_url || null,
      photos: photos || [],
      profile_completion,
      updated_at: new Date().toISOString(),
    })
    .eq('owner_id', user.id)

  if (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, profile_completion })
}
