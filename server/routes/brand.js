import { Router } from 'express'
import db from '../db.js'
import { authMiddleware } from '../middleware.js'

const router = Router()
router.use(authMiddleware)

// Get brand settings
router.get('/', (_req, res) => {
  const settings = db.prepare('SELECT * FROM brand_settings WHERE id = 1').get()
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
  const current = db.prepare('SELECT * FROM brand_settings WHERE id = 1').get()

  db.prepare(
    `UPDATE brand_settings SET
      primary_color = COALESCE(?, primary_color),
      accent_color = COALESCE(?, accent_color),
      neutral_color = COALESCE(?, neutral_color),
      pillars = COALESCE(?, pillars),
      tone = COALESCE(?, tone),
      audience = COALESCE(?, audience),
      health_score = COALESCE(?, health_score)
    WHERE id = 1`
  ).run(
    primary_color || current.primary_color,
    accent_color || current.accent_color,
    neutral_color || current.neutral_color,
    pillars ? JSON.stringify(pillars) : current.pillars,
    tone ? JSON.stringify(tone) : current.tone,
    audience ? JSON.stringify(audience) : current.audience,
    health_score || current.health_score
  )

  const updated = db.prepare('SELECT * FROM brand_settings WHERE id = 1').get()
  updated.pillars = JSON.parse(updated.pillars)
  updated.tone = JSON.parse(updated.tone)
  updated.audience = JSON.parse(updated.audience)
  res.json(updated)
})

// Content ideas
router.get('/ideas', (_req, res) => {
  const rows = db.prepare('SELECT * FROM content_ideas ORDER BY score DESC').all()
  res.json(rows)
})

router.post('/ideas', (req, res) => {
  const { title, format, score, reason } = req.body
  const stmt = db.prepare('INSERT INTO content_ideas (title, format, score, reason) VALUES (?, ?, ?, ?)')
  const info = stmt.run(title, format, score || 85, reason || '')
  const row = db.prepare('SELECT * FROM content_ideas WHERE id = ?').get(info.lastInsertRowid)
  res.status(201).json(row)
})

router.delete('/ideas/:id', (req, res) => {
  const info = db.prepare('DELETE FROM content_ideas WHERE id = ?').run(req.params.id)
  info.changes ? res.json({ deleted: true }) : res.status(404).json({ error: 'Not found' })
})

export default router
