import { Router } from 'express'
import db from '../db.js'
import { authMiddleware, adminMiddleware } from '../middleware.js'

const router = Router()
router.use(authMiddleware)
router.use(adminMiddleware)

// ── GET /api/admin/users ── list all users
router.get('/users', (_req, res) => {
  const users = db.prepare(`
    SELECT
      u.id, u.name, u.email, u.plan, u.created_at,
      u.email_verified, u.onboarding_complete, u.is_admin,
      COALESCE((SELECT SUM(amount) FROM sponsorships WHERE user_id = u.id AND status IN ('confirmed','completed')), 0) as sponsor_revenue,
      COALESCE((SELECT SUM(revenue) FROM affiliates WHERE user_id = u.id), 0) as affiliate_revenue,
      COALESCE((SELECT SUM(revenue) FROM products WHERE user_id = u.id), 0) as product_revenue,
      COALESCE((SELECT COUNT(*) FROM sponsorships WHERE user_id = u.id), 0) as sponsor_count,
      COALESCE((SELECT COUNT(*) FROM leads WHERE user_id = u.id), 0) as lead_count,
      (SELECT COUNT(*) FROM sponsorships WHERE user_id = u.id AND status = 'prospecting') as prospecting_count,
      (SELECT COUNT(*) FROM sponsorships WHERE user_id = u.id AND status = 'negotiating') as negotiating_count,
      (SELECT COUNT(*) FROM sponsorships WHERE user_id = u.id AND status = 'confirmed') as confirmed_count,
      (SELECT COUNT(*) FROM sponsorships WHERE user_id = u.id AND status = 'completed') as completed_count
    FROM users u
    ORDER BY u.created_at DESC
  `).all()

  res.json(users)
})

// ── GET /api/admin/stats ── platform stats
router.get('/stats', (_req, res) => {
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count
  const paidUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE plan IN ('pro', 'studio')").get().count
  const demoUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE email LIKE '%demo%'").get().count
  const verifiedUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE email_verified = 1').get().count

  // MRR estimate (pro = $29, studio = $79)
  const mrr = db.prepare("SELECT COALESCE(SUM(CASE WHEN plan = 'pro' THEN 29 WHEN plan = 'studio' THEN 79 ELSE 0 END), 0) as total FROM users").get().total

  // Active subscriptions (paid + verified)
  const activeSubs = db.prepare("SELECT COUNT(*) as count FROM users WHERE plan IN ('pro','studio') AND email_verified = 1").get().count

  // Pipeline totals across all users
  const pipelineProspecting = db.prepare("SELECT COUNT(*) as count FROM sponsorships WHERE status = 'prospecting'").get().count
  const pipelineNegotiating = db.prepare("SELECT COUNT(*) as count FROM sponsorships WHERE status = 'negotiating'").get().count
  const pipelineConfirmed = db.prepare("SELECT COUNT(*) as count FROM sponsorships WHERE status = 'confirmed'").get().count
  const pipelineCompleted = db.prepare("SELECT COUNT(*) as count FROM sponsorships WHERE status = 'completed'").get().count

  // Total platform revenue from confirmed/completed sponsorships
  const platformRev = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM sponsorships WHERE status IN ('confirmed','completed')").get().total

  // Recent signups (last 7 days)
  const recentSignups = db.prepare("SELECT COUNT(*) as count FROM users WHERE created_at >= datetime('now', '-7 days')").get().count

  // Users by plan
  const planBreakdown = db.prepare(`
    SELECT plan, COUNT(*) as count FROM users GROUP BY plan
  `).all()

  res.json({
    totalUsers,
    paidUsers,
    demoUsers,
    verifiedUsers,
    mrr,
    activeSubs,
    pipeline: {
      prospecting: pipelineProspecting,
      negotiating: pipelineNegotiating,
      confirmed: pipelineConfirmed,
      completed: pipelineCompleted,
    },
    platformRevenue: platformRev,
    recentSignups,
    planBreakdown,
  })
})

// ── POST /api/admin/seed-demo ── reset demo workspace
router.post('/seed-demo', (req, res) => {
  const { userId } = req.body

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' })
  }

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  // Clear existing data
  db.prepare('DELETE FROM sponsorships WHERE user_id = ?').run(userId)
  db.prepare('DELETE FROM affiliates WHERE user_id = ?').run(userId)
  db.prepare('DELETE FROM leads WHERE user_id = ?').run(userId)
  db.prepare('DELETE FROM products WHERE user_id = ?').run(userId)

  // Re-seed with demo data inline
  const sponsors = [
    ['Nike', 4500, 'confirmed', 'Campaign brief approved. Content due in 2 weeks.', userId],
    ['Sephora', 2800, 'negotiating', 'Counter-offer sent. Requesting $3,200 for exclusive 30-day window.', userId],
    ['Adobe', 3200, 'confirmed', 'Annual partnership renewal. Creative Cloud ambassador program.', userId],
    ['Gymshark', 1900, 'prospecting', 'Initial outreach sent. Waiting for brand manager response.', userId],
    ['Skillshare', 2100, 'negotiating', 'Discussing affiliate commission bump from 30% to 40%.', userId],
    ['Samsung', 5200, 'completed', 'Galaxy S25 launch campaign. Paid $5,200 + free device.', userId],
    ['Audible', 1600, 'completed', 'Q2 audiobook promo. 3 stories + 1 post. Paid on time.', userId],
    ['HelloFresh', 2400, 'prospecting', 'Applied via their creator portal. Demo metrics attached.', userId],
  ]

  const seedSponsor = db.prepare("INSERT INTO sponsorships (brand, amount, status, notes, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))")
  for (const s of sponsors) seedSponsor.run(...s)

  const affiliates = [
    ['Amazon Associates', '4%', 8500, 312, 850, '+12%', userId],
    ['Skillshare', '30%', 4200, 98, 620, '+8%', userId],
    ['Epidemic Sound', '$20 flat', 3100, 45, 370, '+22%', userId],
    ['TubeBuddy', '25%', 2800, 34, 290, '-3%', userId],
    ['Notion', '$15 flat', 1900, 28, 420, '+18%', userId],
  ]
  const seedAff = db.prepare("INSERT INTO affiliates (program, commission, clicks, conversions, revenue, trend, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))")
  for (const a of affiliates) seedAff.run(...a)

  const leads = [
    ['Jessica Park', 'jessica@beautybrand.co', 'Instagram DM', userId],
    ['Tomás Rivera', 'tomas@rivermedia.io', 'YouTube About Page', userId],
    ['Amara Osei', 'amara@osei.agency', 'LinkedIn Inbound', userId],
    ['Kevin Lu', 'kevin@techreview.gg', 'CreatorBloom Referral', userId],
    ['Priya Sharma', 'priya.sharma@glowbeauty.in', 'Google Search', userId],
    ['Marcus Webb', 'marcus@webbmedia.co', 'Podcast Guest Appearance', userId],
  ]
  const seedLead = db.prepare("INSERT INTO leads (name, email, source, user_id, created_at) VALUES (?, ?, ?, ?, datetime('now'))")
  for (const l of leads) seedLead.run(...l)

  const products = [
    ['Ultimate Lighting Guide', 'PDF Guide', 29, 142, 4118, '+18%', userId],
    ['Content Calendar Templates', 'Templates', 19, 89, 1691, '+8%', userId],
    ['Brand Pitch Kit', 'Templates', 49, 56, 2744, '+22%', userId],
  ]
  const seedProd = db.prepare("INSERT INTO products (title, type, price, sales, revenue, trend, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))")
  for (const p of products) seedProd.run(...p)

  res.json({ success: true, message: `Demo data seeded for user ${userId}` })
})

export default router
