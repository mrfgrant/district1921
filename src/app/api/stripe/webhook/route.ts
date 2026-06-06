import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  sendPaymentFailed,
  sendPaymentFinalWarning,
  sendSubscriptionCancelled,
  sendBusinessApproved,
} from '@/lib/email'

export const dynamic = 'force-dynamic'

async function getStripe() {
  const Stripe = (await import('stripe')).default
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' as any })
}

export async function POST(req: NextRequest) {
  const stripe = await getStripe()
  const sig = req.headers.get('stripe-signature')!
  const rawBody = await req.text()

  let event: any
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Stripe webhook signature error:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const admin = createAdminClient()

  try {
    switch (event.type) {

      // ── Subscription activated / renewed ──────────────────────
      case 'customer.subscription.created':
      case 'invoice.payment_succeeded': {
        const obj = event.data.object
        const customerId = obj.customer ?? obj.subscription?.customer

        if (!customerId) break

        const { data: biz } = await admin
          .from('businesses')
          .select('id, name, slug, owner_id, profiles!owner_id(email)')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!biz) break

        await admin.from('businesses').update({
          subscription_status: 'active',
          status: 'active',
        }).eq('id', biz.id)

        break
      }

      // ── Payment failed (day 1) ─────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object
        const customerId = invoice.customer
        const nextRetry = invoice.next_payment_attempt
          ? new Date(invoice.next_payment_attempt * 1000).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
          : 'soon'

        const { data: biz } = await admin
          .from('businesses')
          .select('id, name, owner_id, profiles!owner_id(email)')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!biz) break

        const ownerEmail = (biz as any).profiles?.email
        if (ownerEmail) {
          await sendPaymentFailed(ownerEmail, biz.name, nextRetry)
        }
        break
      }

      // ── Subscription past due — final warning ─────────────────
      case 'customer.subscription.updated': {
        const sub = event.data.object
        const prev = event.data.previous_attributes

        // Only fire when status changes TO past_due
        if (sub.status === 'past_due' && prev?.status !== 'past_due') {
          const { data: biz } = await admin
            .from('businesses')
            .select('id, name, owner_id, profiles!owner_id(email)')
            .eq('stripe_customer_id', sub.customer)
            .single()

          if (biz) {
            const ownerEmail = (biz as any).profiles?.email
            if (ownerEmail) {
              await sendPaymentFinalWarning(ownerEmail, biz.name)
            }
          }
        }

        // Subscription reactivated
        if (sub.status === 'active' && prev?.status && prev.status !== 'active') {
          await admin.from('businesses').update({ subscription_status: 'active' })
            .eq('stripe_customer_id', sub.customer)
        }

        break
      }

      // ── Subscription cancelled / expired ──────────────────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object

        const { data: biz } = await admin
          .from('businesses')
          .select('id, name, owner_id, gold_shield, profiles!owner_id(email)')
          .eq('stripe_customer_id', sub.customer)
          .single()

        if (!biz) break

        // Downgrade to free — revoke Gold Shield too
        await admin.from('businesses').update({
          subscription_status: 'cancelled',
          gold_shield: false,
        }).eq('id', biz.id)

        // Update owner role back to free_owner
        await admin.from('profiles').update({ role: 'free_owner' })
          .eq('id', biz.owner_id)

        const ownerEmail = (biz as any).profiles?.email
        if (ownerEmail) {
          await sendSubscriptionCancelled(ownerEmail, biz.name)
        }
        break
      }

      // ── Gold Shield one-time payment succeeded ─────────────────
      case 'checkout.session.completed': {
        const session = event.data.object
        if (session.mode !== 'payment') break
        if (!session.metadata?.businessId) break

        await admin.from('businesses').update({ gold_shield: true })
          .eq('id', session.metadata.businessId)

        break
      }

    }
  } catch (err) {
    console.error(`Webhook handler error for ${event.type}:`, err)
  }

  return NextResponse.json({ received: true })
}
