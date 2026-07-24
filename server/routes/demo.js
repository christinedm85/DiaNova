import { Router } from 'express'
import bcrypt from 'bcryptjs'
import db from '../db.js'
import { generateToken } from '../middleware.js'

const router = Router()

// Demo credentials
const DEMO_EMAIL = 'demo@creatorbloom.app'
const DEMO_PASSWORD = 'demo123'
const DEMO_NAME = 'Demo Creator'

// ── Helpers ──────────────────────────────────────────────

function clearUserData(userId) {
  db.prepare('DELETE FROM sponsorships WHERE user_id = ?').run(userId)
  db.prepare('DELETE FROM affiliates WHERE user_id = ?').run(userId)
  db.prepare('DELETE FROM leads WHERE user_id = ?').run(userId)
  db.prepare('DELETE FROM products WHERE user_id = ?').run(userId)
}

function seedDemoData(userId) {
  // ── Sponsorships (8 across all pipeline stages) ──
  const seedSponsor = db.prepare("INSERT INTO sponsorships (brand, amount, status, notes, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))")
  const sponsors = [
    ['Nike', 4500, 'confirmed', 'Campaign brief approved. Content due in 2 weeks. 2 Instagram posts + 1 Reel.', userId],
    ['Sephora', 2800, 'negotiating', 'Counter-offer sent. Requesting $3,200 for exclusive 30-day window.', userId],
    ['Adobe', 3200, 'confirmed', 'Annual partnership renewal. Creative Cloud ambassador program.', userId],
    ['Gymshark', 1900, 'prospecting', 'Initial outreach sent. Waiting for brand manager response.', userId],
    ['Skillshare', 2100, 'negotiating', 'Discussing affiliate commission bump from 30% to 40%.', userId],
    ['Samsung', 5200, 'completed', 'Galaxy S25 launch campaign. Paid $5,200 + free device.', userId],
    ['Audible', 1600, 'completed', 'Q2 audiobook promo. 3 stories + 1 post. Paid on time.', userId],
    ['HelloFresh', 2400, 'prospecting', 'Applied via their creator portal. Demo metrics attached.', userId],
  ]
  for (const s of sponsors) seedSponsor.run(...s)

  // ── Affiliates (5 with realistic data) ──
  const seedAff = db.prepare("INSERT INTO affiliates (program, commission, clicks, conversions, revenue, trend, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))")
  const affiliates = [
    ['Amazon Associates', '4%', 8500, 312, 850, '+12%', userId],
    ['Skillshare', '30%', 4200, 98, 620, '+8%', userId],
    ['Epidemic Sound', '$20 flat', 3100, 45, 370, '+22%', userId],
    ['TubeBuddy', '25%', 2800, 34, 290, '-3%', userId],
    ['Notion', '$15 flat', 1900, 28, 420, '+18%', userId],
  ]
  for (const a of affiliates) seedAff.run(...a)

  // ── Leads (6 with funnel data) ──
  const seedLead = db.prepare("INSERT INTO leads (name, email, source, user_id, created_at) VALUES (?, ?, ?, ?, datetime('now'))")
  const leads = [
    ['Jessica Park', 'jessica@beautybrand.co', 'Instagram DM', userId],
    ['Tomás Rivera', 'tomas@rivermedia.io', 'YouTube About Page', userId],
    ['Amara Osei', 'amara@osei.agency', 'LinkedIn Inbound', userId],
    ['Kevin Lu', 'kevin@techreview.gg', 'CreatorBloom Referral', userId],
    ['Priya Sharma', 'priya.sharma@glowbeauty.in', 'Google Search', userId],
    ['Marcus Webb', 'marcus@webbmedia.co', 'Podcast Guest Appearance', userId],
  ]
  for (const l of leads) seedLead.run(...l)

  // ── Digital Products (3) ──
  const seedProd = db.prepare("INSERT INTO products (title, type, price, sales, revenue, trend, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))")
  const products = [
    ['Ultimate Lighting Guide', 'PDF Guide', 29, 142, 4118, '+18%', userId],
    ['Content Calendar Templates', 'Templates', 19, 89, 1691, '+8%', userId],
    ['Brand Pitch Kit', 'Templates', 49, 56, 2744, '+22%', userId],
  ]
  for (const p of products) seedProd.run(...p)

  // ── Brand Kit (via brand_settings) ──
  // Upsert brand_settings for this user
  const existing = db.prepare('SELECT id FROM brand_settings WHERE user_id = ?').get(userId)
  if (existing) {
    db.prepare(`UPDATE brand_settings SET
      primary_color = '#6366F1',
      accent_color = '#F59E0B',
      neutral_color = '#0F172A',
      pillars = ?,
      tone = ?,
      audience = ?,
      health_score = 82
    WHERE user_id = ?`).run(
      JSON.stringify(['Tech & Lifestyle', 'Creator Economy', 'Product Reviews', 'Tutorials', 'Behind the Scenes']),
      JSON.stringify(['Educational', 'Authentic', 'Inspirational', 'Humorous', 'Professional']),
      JSON.stringify(['Aspiring Creators', 'Freelancers', 'Small Business', 'Tech Enthusiasts']),
      userId
    )
  } else {
    db.prepare(`INSERT INTO brand_settings (user_id, primary_color, accent_color, neutral_color, pillars, tone, audience, health_score)
      VALUES (?, '#6366F1', '#F59E0B', '#0F172A', ?, ?, ?, 82)`).run(
      userId,
      JSON.stringify(['Tech & Lifestyle', 'Creator Economy', 'Product Reviews', 'Tutorials', 'Behind the Scenes']),
      JSON.stringify(['Educational', 'Authentic', 'Inspirational', 'Humorous', 'Professional']),
      JSON.stringify(['Aspiring Creators', 'Freelancers', 'Small Business', 'Tech Enthusiasts'])
    )
  }

  // Re-seed content ideas for the demo
  db.prepare('DELETE FROM content_ideas WHERE user_id = ?').run(userId)
  const seedIdea = db.prepare('INSERT INTO content_ideas (user_id, title, format, score, reason) VALUES (?, ?, ?, ?, ?)')
  const ideas = [
    [userId, 'My $12K/Month Sponsorship Stack (Full Breakdown)', 'YouTube Video', 94, 'Topical + monetization angle'],
    [userId, 'How I Landed Nike as a 50K Creator', 'Short-form Video', 91, 'High share potential'],
    [userId, 'Affiliate Programs That Pay 20%+ Commissions', 'Blog / Newsletter', 88, 'Evergreen + affiliate potential'],
    [userId, 'Pricing Tier: When to Charge More', 'Thread / Carousel', 85, 'High save & share rate'],
    [userId, 'Behind the Scenes: Negotiating a $5K Brand Deal', 'Short-form Video', 90, 'Trending format + authenticity'],
    [userId, 'My Exact Content Calendar System', 'Templates', 87, 'Lead magnet potential'],
    [userId, 'Creator Tools I Can\'t Live Without in 2026', 'YouTube Video', 83, 'Affiliate linking opportunity'],
    [userId, 'How to Turn 1 Video into 5 Income Streams', 'Thread / Carousel', 89, 'Monetization focus'],
  ]
  for (const i of ideas) seedIdea.run(...i)
  }

// ── POST /api/demo/seed (access code protected) ────────

router.post('/seed', (req, res) => {
  try {
    // Validate access code
    const { accessCode } = req.body
    if (!accessCode || accessCode !== process.env.DEMO_ACCESS_CODE) {
      return res.status(403).json({ error: 'Invalid access code' })
    }

    // Find or create demo user
    let demoUser = db.prepare('SELECT id, name, email, plan, email_verified, onboarding_complete, is_admin FROM users WHERE email = ?').get(DEMO_EMAIL)

    if (!demoUser) {
      const hash = bcrypt.hashSync(DEMO_PASSWORD, 10)
      const info = db.prepare('INSERT INTO users (name, email, password, plan, email_verified, onboarding_complete) VALUES (?, ?, ?, ?, 1, 1)').run(DEMO_NAME, DEMO_EMAIL, hash, 'pro')
      demoUser = db.prepare('SELECT id, name, email, plan, email_verified, onboarding_complete, is_admin FROM users WHERE id = ?').get(info.lastInsertRowid)
    }

    // Clear and re-seed demo data
    clearUserData(demoUser.id)
    seedDemoData(demoUser.id)

    // Generate token
    const token = generateToken(demoUser)
    const { ...safeUser } = demoUser
    safeUser.is_admin = demoUser.is_admin || 0

    res.json({ user: safeUser, token })
  } catch (err) {
    console.error('Demo seed error:', err)
    res.status(500).json({ error: 'Failed to seed demo data' })
  }
})

export default router
