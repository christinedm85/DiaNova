import { Router } from 'express'
import db from '../db.js'
import { authMiddleware } from '../middleware.js'
import { PLANS, createCheckoutSession, createPortalSession, verifyWebhook } from '../stripe.js'

const router = Router()

// Get all plans (public)
router.get('/plans', (_req, res) => {
  res.json(Object.values(PLANS).map(({ id, name, price, features }) => ({ id, name, price, features })))
})

// Get current user's plan
router.get('/my-plan', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT plan, stripe_customer_id FROM users WHERE id = ?').get(req.user.id)
  const plan = PLANS[user.plan] || PLANS.free
  res.json({
    current: user.plan,
    plan,
    hasStripeCustomer: !!user.stripe_customer_id,
  })
})

// Create checkout session
router.post('/checkout', authMiddleware, async (req, res) => {
  try {
    const { planId } = req.body
    if (!PLANS[planId] || planId === 'free') {
      return res.status(400).json({ error: 'Invalid plan' })
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
    const session = await createCheckoutSession(user, planId)

    res.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err.message)
    // In test/placeholder mode, simulate success
    if (err.message.includes('Invalid API Key') || err.message.includes('No such price')) {
      const { planId } = req.body
      db.prepare('UPDATE users SET plan = ? WHERE id = ?').run(planId, req.user.id)
      return res.json({
        url: '/billing?success=true',
        simulated: true,
        message: `Upgraded to ${PLANS[planId].name} (test mode — add Stripe keys for live payments)`,
      })
    }
    res.status(500).json({ error: 'Checkout failed' })
  }
})

// Create customer portal
router.post('/portal', authMiddleware, async (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
    if (!user.stripe_customer_id) {
      return res.status(400).json({ error: 'No Stripe customer found' })
    }
    const session = await createPortalSession(user)
    res.json({ url: session.url })
  } catch (err) {
    res.status(500).json({ error: 'Portal unavailable' })
  }
})

// Stripe webhook
router.post('/webhook', async (req, res) => {
  // Raw body needed for webhook verification — using JSON fallback for now
  try {
    const event = req.body

    switch (event.type) {
      case 'checkout.session.completed': {
        const { userId, planId } = event.data.object.metadata || {}
        if (userId && planId) {
          const customerId = event.data.object.customer
          db.prepare('UPDATE users SET plan = ?, stripe_customer_id = ? WHERE id = ?').run(planId, customerId, userId)
          console.log(`User ${userId} upgraded to ${planId}`)
        }
        break
      }
      case 'customer.subscription.deleted': {
        const customerId = event.data.object.customer
        db.prepare("UPDATE users SET plan = 'free' WHERE stripe_customer_id = ?").run(customerId)
        break
      }
    }

    res.json({ received: true })
  } catch (err) {
    res.status(400).json({ error: 'Webhook error' })
  }
})

// Cancel/downgrade to free (for test mode)
router.post('/cancel', authMiddleware, (req, res) => {
  db.prepare("UPDATE users SET plan = 'free' WHERE id = ?").run(req.user.id)
  res.json({ plan: 'free', message: 'Downgraded to Free plan' })
})

export default router
