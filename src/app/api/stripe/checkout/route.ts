import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  // Lazy-import Stripe to avoid build-time initialization without env vars
  const { createSubscriptionCheckout, createGoldShieldCheckout } = await import('@/lib/stripe')

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { businessId, type } = await req.json()

  if (!businessId || !type) {
    return NextResponse.json({ error: 'Missing businessId or type' }, { status: 400 })
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, owner_id, subscription_status')
    .eq('id', businessId)
    .eq('owner_id', user.id)
    .single()

  if (!business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`

  try {
    let session

    if (type === 'subscription') {
      if (business.subscription_status === 'active') {
        return NextResponse.json({ error: 'Already subscribed' }, { status: 400 })
      }
      session = await createSubscriptionCheckout(businessId, user.email!, returnUrl)
    } else if (type === 'gold_shield') {
      if (business.subscription_status !== 'active') {
        return NextResponse.json({ error: 'Active subscription required for Gold Shield' }, { status: 400 })
      }
      session = await createGoldShieldCheckout(businessId, user.email!, returnUrl)
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
