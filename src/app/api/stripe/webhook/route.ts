import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'

// App Router route handlers receive raw Request — no body parser config needed
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {

      // ── New checkout completed (subscription OR gold shield) ──────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.CheckoutSession
        const businessId = session.metadata?.businessId
        if (!businessId) break

        if (session.metadata?.type === 'gold_shield') {
          // Gold Shield payment — mark as paid, trigger verification flow
          await supabase
            .from('shield_applications')
            .update({ stripe_payment_intent_id: session.payment_intent as string })
            .eq('business_id', businessId)
        } else {
          // Subscription — activate listing
          await supabase
            .from('businesses')
            .update({
              subscription_status: 'active',
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              status: 'pending', // still needs mod approval if new
            })
            .eq('id', businessId)

          // Upgrade owner role
          const { data: biz } = await supabase
            .from('businesses')
            .select('owner_id')
            .eq('id', businessId)
            .single()

          if (biz?.owner_id) {
            await supabase
              .from('profiles')
              .update({ role: 'paid_owner' })
              .eq('id', biz.owner_id)
          }
        }
        break
      }

      // ── Subscription renewed successfully ─────────────────────────────────
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.billing_reason === 'subscription_cycle') {
          await supabase
            .from('businesses')
            .update({ subscription_status: 'active' })
            .eq('stripe_subscription_id', invoice.subscription as string)
        }
        break
      }

      // ── Payment failed — mark past_due ────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await supabase
          .from('businesses')
          .update({ subscription_status: 'past_due' })
          .eq('stripe_subscription_id', invoice.subscription as string)

        // TODO: trigger dunning email via Resend
        break
      }

      // ── Subscription updated (e.g. renewal date change) ───────────────────
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const status = sub.status === 'active' ? 'active'
          : sub.status === 'past_due' ? 'past_due'
          : 'canceled'

        await supabase
          .from('businesses')
          .update({ subscription_status: status })
          .eq('stripe_subscription_id', sub.id)
        break
      }

      // ── Subscription canceled or lapsed — suspend listing, revoke shield ──
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription

        const { data: biz } = await supabase
          .from('businesses')
          .select('id, owner_id')
          .eq('stripe_subscription_id', sub.id)
          .single()

        if (biz) {
          await supabase
            .from('businesses')
            .update({
              subscription_status: 'canceled',
              status: 'suspended',
              gold_shield: false,
              shield_approved_at: null,
            })
            .eq('id', biz.id)

          // Downgrade owner role
          if (biz.owner_id) {
            await supabase
              .from('profiles')
              .update({ role: 'free_owner' })
              .eq('id', biz.owner_id)
          }
        }

        // TODO: send "your listing is paused" email via Resend
        break
      }

      // ── Gold Shield one-time payment confirmed ────────────────────────────
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent
        // Only handle if it's a Gold Shield payment (checkout.session.completed handles the rest)
        // Additional verification logic runs via /api/shield route
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    console.error(`Error handling ${event.type}:`, err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
