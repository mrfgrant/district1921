import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { email, type, business_name, business_city, owner_email } = await req.json()

  if (!type) return NextResponse.json({ error: 'Missing type' }, { status: 400 })
  if (type === 'suggest' && !business_name) return NextResponse.json({ error: 'Missing business name' }, { status: 400 })
  if (type !== 'suggest' && !email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('preregistrations')
    .insert({
      email: email ? email.toLowerCase().trim() : null,
      type,
      business_name: business_name?.trim() || null,
      business_city: business_city?.trim() || null,
      owner_email: owner_email?.toLowerCase().trim() || null,
    })

  if (error) {
    if (error.code === '23505') return NextResponse.json({ ok: true })
    console.error('Preregistration error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }

  // Fire emails for suggestions (non-blocking)
  if (type === 'suggest') {
    const { sendSuggestionNotification, sendOwnerOutreach, sendSuggestionConfirmation } = await import('@/lib/email')

    // 1. Notify you immediately
    sendSuggestionNotification({
      businessName: business_name,
      businessCity: business_city,
      suggesterEmail: email,
    }).catch(e => console.error('Suggestion notification failed:', e))

    // 2. Email the business owner if provided
    if (owner_email) {
      sendOwnerOutreach({
        to: owner_email,
        businessName: business_name,
        businessCity: business_city,
        suggesterEmail: email,
      }).catch(e => console.error('Owner outreach failed:', e))

      // Mark as notified
      supabase.from('preregistrations')
        .update({ notified_at: new Date().toISOString() })
        .eq('business_name', business_name)
        .is('notified_at', null)
        .catch(() => {})
    }

    // 3. Confirm to suggester if they gave their email
    if (email) {
      sendSuggestionConfirmation({
        to: email,
        businessName: business_name,
      }).catch(e => console.error('Suggestion confirmation failed:', e))
    }
  }

  return NextResponse.json({ ok: true })
}
