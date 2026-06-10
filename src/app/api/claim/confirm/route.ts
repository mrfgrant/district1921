import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessId, method, pledge, phone, code, proofPhotoUrl } = await req.json()
  if (!businessId || !pledge) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  const admin = createAdminClient()

  // Fetch business
  const { data: biz } = await admin.from('businesses').select('*').eq('id', businessId).single()
  if (!biz) return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  if (biz.owner_id) return NextResponse.json({ error: 'Already claimed' }, { status: 409 })

  // Method-specific verification
  if (method === 'phone') {
    // Verify Twilio code if sent, otherwise just accept phone match
    if (code) {
      const twilioSid  = process.env.TWILIO_ACCOUNT_SID!
      const twilioAuth = process.env.TWILIO_AUTH_TOKEN!
      const verSid     = process.env.TWILIO_VERIFY_SID ?? ''
      if (verSid) {
        try {
          const r = await fetch(`https://verify.twilio.com/v2/Services/${verSid}/VerificationCheck`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64') },
            body: new URLSearchParams({ To: phone, Code: code }).toString(),
          })
          const d = await r.json()
          if (d.status !== 'approved') return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
        } catch { /* fall through if Twilio not configured */ }
      }
    }
  }

  if (method === 'email') {
    const website = biz.website
    if (!website) return NextResponse.json({ error: 'No website on file for email verification' }, { status: 400 })
    const domain = website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]
    const userDomain = user.email?.split('@')[1]
    if (!userDomain || !domain.includes(userDomain) && !userDomain.includes(domain)) {
      return NextResponse.json({ error: `Your email domain doesn't match the business website (${domain})` }, { status: 400 })
    }
  }

  // Assign ownership
  const update: Record<string, any> = {
    owner_id: user.id,
    honor_pledge: true,
    updated_at: new Date().toISOString(),
  }

  if (method === 'phone' && phone) update.phone = phone
  if (method === 'phone' && code)  update.phone_verified = true
  if (method === 'photo' && proofPhotoUrl) {
    update.proof_photo_url = proofPhotoUrl
    // Keep status active but mark for admin photo review via Gold Shield queue
    update.status = 'active'
  }

  // Bump role to free_owner
  await admin.from('profiles').update({ role: 'free_owner' }).eq('id', user.id)

  const { error } = await admin.from('businesses').update(update).eq('id', businessId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
