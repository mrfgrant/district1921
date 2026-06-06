import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

// Helper: get subscription ID from an invoice (Stripe API changed in 2025)
function getSubscriptionId(invoice: Stripe.Invoice): string | null {
  // New API: subscription lives on invoice.parent.subscription_details.subscription
  if (invoice.parent?.type === 'subscription_details') {
    const sub = (invoice.parent as Stripe.Invoice.Parent & {
      subscription_details?: { subscription?: string | Stripe.Subscription }
    }).subscription_details?.subscription
    if (sub) return typeof sub === 'string' ? sub : sub.id
  }
  return null
}

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
        const session = event.data.object as Stripe.Checkout.Session
        const businessId = session.metadata?.businessId
        if (!businessId) break

        if (session.metadata?.type === 'gold_shield') {
          await supabase
            .from('shield_applications')
            .update({ stripe_payment_intent_id: session.payment_intent as string })
            .eq('business_id', businessId)
        } else {
          await supabase
            .from('businesses')
            .update({
              subscription_status: 'active',
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              status: 'pending',
            })
            .eq('id', businessId)

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
        const subId = getSubscriptionId(invoice)
        if (subId && invoice.billing_reason === 'subscription_cycle') {
          await supabase
            .from('businesses')
            .update({ subscription_status: 'active' })
            .eq('stripe_subscription_id', subId)
        }
        break
      }

      // ── Payment failed — mark past_due ────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subId = getSubscriptionId(invoice)
        if (subId) {
          await supabase
            .from('businesses')
            .update({ subscription_status: 'past_due' })
            .eq('stripe_subscription_id', subId)
        }
        // TODO: trigger dunning email via Resend
        break
      }

      // ── Subscription updated ──────────────────────────────────────────────
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const status =
          sub.status === 'active' ? 'active'
          : sub.status === 'past_due' ? 'past_due'
          : 'canceled'
        await supabase
          .from('businesses')
          .update({ subscription_status: status })
          .eq('stripe_subscription_id', sub.id)
        break
      }

      // ── Subscription canceled — suspend listing, revoke shield ────────────
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

      case 'payment_intent.succeeded':
        // Gold Shield one-time payments handled via checkout.session.completed
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    console.error(`Error handling ${event.type}:`, err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
