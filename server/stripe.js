import Stripe from 'stripe'

// Replace these with real keys from https://dashboard.stripe.com/test/apikeys
const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder'
const STRIPE_WEBHOOK = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'

const stripe = new Stripe(STRIPE_SECRET)

// Plan definitions matching the business plan
export const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    features: ['Basic sponsorship tracker', 'Limited affiliate links (3)', '1 digital product listing', 'Basic pricing guidance'],
    limits: { sponsorships: 5, affiliates: 3, products: 1 },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_placeholder',
    features: ['Full sponsorship CRM', 'Unlimited affiliate optimization', 'Digital product sales + analytics', 'Pricing guidance', 'Lead capture forms', 'Brand kit builder'],
    limits: { sponsorships: 999, affiliates: 999, products: 50 },
  },
  studio: {
    id: 'studio',
    name: 'Studio',
    price: 79,
    priceId: process.env.STRIPE_STUDIO_PRICE_ID || 'price_studio_placeholder',
    features: ['Multi-channel dashboards', 'White-labeled proposals', 'Team access (up to 5)', 'Priority support', 'Everything in Pro'],
    limits: { sponsorships: 9999, affiliates: 9999, products: 999 },
  },
}

export async function createCheckoutSession(user, planId) {
  const plan = PLANS[planId]
  if (!plan || plan.id === 'free') {
    throw new Error('Invalid plan for checkout')
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: user.email,
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${process.env.APP_URL || 'http://localhost:80'}/billing?success=true`,
    cancel_url: `${process.env.APP_URL || 'http://localhost:80'}/billing?canceled=true`,
    metadata: { userId: String(user.id), planId },
  })

  return session
}

export async function createPortalSession(user) {
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${process.env.APP_URL || 'http://localhost:80'}/billing`,
  })
  return session
}

export async function verifyWebhook(payload, signature) {
  return stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK)
}

export default stripe
