import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendMagicLink } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Generate the magic link via Supabase admin — skips Supabase's own email sender
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: email.toLowerCase().trim(),
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error || !data?.properties?.action_link) {
    console.error('Magic link generation error:', error)
    return NextResponse.json({ error: 'Failed to generate link' }, { status: 500 })
  }

  // Send via Resend on district1921.com domain
  const { error: emailError } = await sendMagicLink(email, data.properties.action_link)

  if (emailError) {
    console.error('Resend error:', emailError)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
