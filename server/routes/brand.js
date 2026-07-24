import { Router } from 'express'
import db from '../db.js'
import { authMiddleware } from '../middleware.js'

const router = Router()
router.use(authMiddleware)

// Get brand settings
router.get('/', (req, res) => {
  const settings = db.prepare('SELECT * FROM brand_settings WHERE user_id = ?').get(req.user.id)
  if (settings) {
    settings.pillars = JSON.parse(settings.pillars)
    settings.tone = JSON.parse(settings.tone)
    settings.audience = JSON.parse(settings.audience)
  }
  res.json(settings || {})
})

// Update brand settings
router.put('/', (req, res) => {
  const { primary_color, accent_color, neutral_color, pillars, tone, audience, health_score } = req.body
  const current = db.prepare('SELECT * FROM brand_settings WHERE user_id = ?').get(req.user.id)

  if (!current) {
    // Create if not exists
    db.prepare(`INSERT INTO brand_settings (user_id, primary_color, accent_color, neutral_color, pillars, tone, audience, health_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
      req.user.id,
      primary_color || '#6366F1',
      accent_color || '#F59E0B',
      neutral_color || '#0F172A',
      pillars ? JSON.stringify(pillars) : '["Content Creation","Creator Economy","Tech Reviews","Productivity"]',
      tone ? JSON.stringify(tone) : '["Educational","Authentic","Inspirational","Humorous"]',
      audience ? JSON.stringify(audience) : '["Aspiring Creators","Freelancers","Small Business"]',
      health_score || 78
    )
    const created = db.prepare('SELECT * FROM brand_settings WHERE user_id = ?').get(req.user.id)
    created.pillars = JSON.parse(created.pillars)
    created.tone = JSON.parse(created.tone)
    created.audience = JSON.parse(created.audience)
    return res.json(created)
  }

  db.prepare(
    `UPDATE brand_settings SET
      primary_color = COALESCE(?, primary_color),
      accent_color = COALESCE(?, accent_color),
      neutral_color = COALESCE(?, neutral_color),
      pillars = COALESCE(?, pillars),
      tone = COALESCE(?, tone),
      audience = COALESCE(?, audience),
      health_score = COALESCE(?, health_score)
    WHERE user_id = ?`
  ).run(
    primary_color || current.primary_color,
    accent_color || current.accent_color,
    neutral_color || current.neutral_color,
    pillars ? JSON.stringify(pillars) : current.pillars,
    tone ? JSON.stringify(tone) : current.tone,
    audience ? JSON.stringify(audience) : current.audience,
    health_score || current.health_score,
    req.user.id
  )

  const updated = db.prepare('SELECT * FROM brand_settings WHERE user_id = ?').get(req.user.id)
  updated.pillars = JSON.parse(updated.pillars)
  updated.tone = JSON.parse(updated.tone)
  updated.audience = JSON.parse(updated.audience)
  res.json(updated)
})

// Content ideas
router.get('/ideas', (req, res) => {
  const rows = db.prepare('SELECT * FROM content_ideas WHERE user_id = ? ORDER BY score DESC').all(req.user.id)
  res.json(rows)
})

router.post('/ideas', (req, res) => {
  const { title, format, score, reason } = req.body
  const stmt = db.prepare('INSERT INTO content_ideas (user_id, title, format, score, reason) VALUES (?, ?, ?, ?, ?)')
  const info = stmt.run(req.user.id, title, format, score || 85, reason || '')
  const row = db.prepare('SELECT * FROM content_ideas WHERE id = ?').get(info.lastInsertRowid)
  res.status(201).json(row)
})

router.delete('/ideas/:id', (req, res) => {
  const info = db.prepare('DELETE FROM content_ideas WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id)
  info.changes ? res.json({ deleted: true }) : res.status(404).json({ error: 'Not found' })
})

export default router
