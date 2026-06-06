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

  // Derive origin from request headers so preview deploys get the right URL
  // x-forwarded-host is set by Vercel on all deployments
  const forwardedHost = req.headers.get('x-forwarded-host')
  const forwardedProto = req.headers.get('x-forwarded-proto') || 'https'
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : process.env.NEXT_PUBLIC_APP_URL!

  const redirectTo = `${origin}/auth/callback`

  // Generate the magic link via Supabase admin — skips Supabase's own email sender
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: email.toLowerCase().trim(),
    options: { redirectTo },
  })

  if (error || !data?.properties?.action_link) {
    console.error('Magic link generation error:', error)
    return NextResponse.json({ error: 'Failed to generate link' }, { status: 500 })
  }

  // The action_link points to Supabase's auth server which then redirects to our redirectTo.
  // We need to ensure our redirectTo is in Supabase's allowed list.
  // Send via Resend on district1921.com domain
  const { error: emailError } = await sendMagicLink(email, data.properties.action_link)

  if (emailError) {
    console.error('Resend error:', emailError)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
