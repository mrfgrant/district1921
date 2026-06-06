import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET — get or create referral code for the current user
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('referral_code, referral_credits_cents').eq('id', user.id).single()

  if (profile?.referral_code) {
    const { data: referrals } = await supabase
      .from('referrals').select('*').eq('referrer_id', user.id).order('created_at', { ascending: false })
    return NextResponse.json({ code: profile.referral_code, credits: profile.referral_credits_cents, referrals: referrals ?? [] })
  }

  // Generate a new code
  const code = `${user.email?.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,8)}-${Math.random().toString(36).slice(2,6)}`
  const admin = createAdminClient()
  await admin.from('profiles').update({ referral_code: code }).eq('id', user.id)
  await admin.from('referrals').insert({ referrer_id: user.id, referral_code: code })

  return NextResponse.json({ code, credits: 0, referrals: [] })
}

// POST — track a referral conversion
export async function POST(req: NextRequest) {
  const { code } = await req.json()
  if (!code) return NextResponse.json({ ok: true })

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: true })

  const admin = createAdminClient()
  const { data: referral } = await admin
    .from('referrals').select('*').eq('referral_code', code).single()

  if (!referral || referral.referrer_id === user.id || referral.status !== 'pending') {
    return NextResponse.json({ ok: true })
  }

  const CREDIT_CENTS = 1500 // $15 credit per referral
  await admin.from('referrals').update({
    referee_id: user.id, status: 'converted', converted_at: new Date().toISOString()
  }).eq('referral_code', code)

  await admin.from('profiles').update({
    referral_credits_cents: admin.rpc as any,
  }).eq('id', referral.referrer_id)

  // Simple increment
  await admin.rpc('increment_referral_credits', { user_id: referral.referrer_id, amount: CREDIT_CENTS })

  return NextResponse.json({ ok: true })
}
