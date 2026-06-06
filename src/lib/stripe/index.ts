import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
  typescript: true,
})

export const STRIPE_PRICES = {
  subscription: process.env.STRIPE_SUBSCRIPTION_PRICE_ID!,  // $90/6mo
  goldShield: process.env.STRIPE_GOLD_SHIELD_PRICE_ID!,      // $25 one-time
} as const

export async function createSubscriptionCheckout(
  businessId: string,
  email: string,
  returnUrl: string
) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [{ price: STRIPE_PRICES.subscription, quantity: 1 }],
    success_url: `${returnUrl}?success=subscription`,
    cancel_url: `${returnUrl}?canceled=1`,
    metadata: { businessId },
    subscription_data: {
      metadata: { businessId },
    },
  })
  return session
}

export async function createGoldShieldCheckout(
  businessId: string,
  email: string,
  returnUrl: string
) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [{ price: STRIPE_PRICES.goldShield, quantity: 1 }],
    success_url: `${returnUrl}?success=shield`,
    cancel_url: `${returnUrl}?canceled=1`,
    metadata: { businessId, type: 'gold_shield' },
  })
  return session
}
