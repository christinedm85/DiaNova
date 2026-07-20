import { Router } from 'express'
import db from '../db.js'
import { authMiddleware, optionalAuth } from '../middleware.js'

const router = Router()

// Log pageview (no auth required — tracks anonymous too)
router.post('/pageview', optionalAuth, (req, res) => {
  const { path } = req.body
  if (!path) return res.status(400).json({ error: 'path required' })
  db.prepare('INSERT INTO pageviews (path, user_id, referrer) VALUES (?, ?, ?)')
    .run(path, req.user?.id || null, req.body.referrer || null)
  res.status(201).json({ ok: true })
})

// Log conversion (auth required)
router.post('/conversion', authMiddleware, (req, res) => {
  const { type, metadata } = req.body
  if (!type) return res.status(400).json({ error: 'type required' })
  db.prepare('INSERT INTO conversions (type, user_id, metadata) VALUES (?, ?, ?)')
    .run(type, req.user.id, metadata ? JSON.stringify(metadata) : null)
  res.status(201).json({ ok: true })
})

// Get stats (auth required)
router.get('/stats', authMiddleware, (req, res) => {
  const days = parseInt(req.query.days) || 30

  const totalPageviews = db.prepare(
    "SELECT COUNT(*) as count FROM pageviews WHERE created_at > datetime('now', ?)"
  ).get(`-${days} days`).count

  const uniqueVisitors = db.prepare(
    "SELECT COUNT(DISTINCT COALESCE(user_id, 'anon-' || referrer)) as count FROM pageviews WHERE created_at > datetime('now', ?)"
  ).get(`-${days} days`).count

  const topPages = db.prepare(
    "SELECT path, COUNT(*) as views FROM pageviews WHERE created_at > datetime('now', ?) GROUP BY path ORDER BY views DESC LIMIT 10"
  ).all(`-${days} days`)

  const conversions = db.prepare(
    "SELECT type, COUNT(*) as count FROM conversions WHERE created_at > datetime('now', ?) GROUP BY type ORDER BY count DESC"
  ).all(`-${days} days`)

  const dailyPageviews = db.prepare(
    "SELECT DATE(created_at) as date, COUNT(*) as count FROM pageviews WHERE created_at > datetime('now', ?) GROUP BY DATE(created_at) ORDER BY date"
  ).all(`-${days} days`)

  const dailyConversions = db.prepare(
    "SELECT DATE(created_at) as date, COUNT(*) as count FROM conversions WHERE created_at > datetime('now', ?) GROUP BY DATE(created_at) ORDER BY date"
  ).all(`-${days} days`)

  res.json({
    period: `${days} days`,
    totalPageviews,
    uniqueVisitors,
    topPages,
    conversions,
    dailyPageviews,
    dailyConversions,
  })
})

export default router
