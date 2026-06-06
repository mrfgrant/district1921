import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { email, type, business_name, business_city } = await req.json()

  if (!type) {
    return NextResponse.json({ error: 'Missing type' }, { status: 400 })
  }

  // Suggest mode requires business info but not email
  if (type === 'suggest' && !business_name) {
    return NextResponse.json({ error: 'Missing business name' }, { status: 400 })
  }

  // Community/owner modes require email
  if (type !== 'suggest' && !email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('preregistrations')
    .insert({
      email: email ? email.toLowerCase().trim() : null,
      type,
      business_name: business_name || null,
      business_city: business_city || null,
    })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ ok: true }) // duplicate email — idempotent
    }
    console.error('Preregistration error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
