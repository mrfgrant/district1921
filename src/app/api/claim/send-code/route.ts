import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { phone } = await req.json()
  if (!phone) return NextResponse.json({ error: 'Phone required' }, { status: 400 })

  const twilioSid  = process.env.TWILIO_ACCOUNT_SID!
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN!
  const verSid     = process.env.TWILIO_VERIFY_SID ?? ''

  if (!verSid) {
    // Twilio Verify not configured — skip and return success (dev mode)
    return NextResponse.json({ success: true, dev: true })
  }

  const digits = phone.replace(/\D/g, '')
  const e164   = digits.length === 10 ? `+1${digits}` : `+${digits}`

  try {
    const r = await fetch(`https://verify.twilio.com/v2/Services/${verSid}/Verifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64') },
      body: new URLSearchParams({ To: e164, Channel: 'sms' }).toString(),
    })
    const d = await r.json()
    if (d.status !== 'pending') return NextResponse.json({ error: 'Could not send verification code' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'SMS delivery failed' }, { status: 500 })
  }
}
