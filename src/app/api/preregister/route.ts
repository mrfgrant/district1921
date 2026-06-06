import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { email, type } = await req.json()

  if (!email || !type) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('preregistrations')
    .insert({ email: email.toLowerCase().trim(), type })

  if (error) {
    // Ignore duplicate email errors — idempotent
    if (error.code === '23505') {
      return NextResponse.json({ ok: true })
    }
    console.error('Preregistration error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
