import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkWebsiteReachable, checkPhoneVerified } from '@/lib/verification'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessId, proofPhotoUrl } = await req.json()
  if (!businessId || !proofPhotoUrl) {
    return NextResponse.json({ error: 'Missing businessId or proof photo' }, { status: 400 })
  }

  const { data: biz } = await supabase
    .from('businesses')
    .select('id, name, phone, website, state, subscription_status, owner_id')
    .eq('id', businessId).eq('owner_id', user.id).single()

  if (!biz) return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  if (biz.subscription_status !== 'active') {
    return NextResponse.json({ error: 'Active subscription required' }, { status: 403 })
  }

  const [websiteReachable, phoneVerified] = await Promise.all([
    biz.website ? checkWebsiteReachable(biz.website) : Promise.resolve(false),
    biz.phone ? checkPhoneVerified(biz.phone) : Promise.resolve(false),
  ])

  const admin = createAdminClient()
  await admin.from('shield_applications').upsert({
    business_id: businessId,
    proof_photo_url: proofPhotoUrl,
    status: 'pending',
    submitted_at: new Date().toISOString(),
  }, { onConflict: 'business_id' })

  await admin.from('businesses').update({
    website_reachable: websiteReachable,
    phone_verified: phoneVerified,
    proof_photo_url: proofPhotoUrl,
  }).eq('id', businessId)

  return NextResponse.json({ ok: true, checks: { websiteReachable, phoneVerified } })
}
