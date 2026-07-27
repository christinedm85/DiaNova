import { Router } from 'express'
import db from '../db.js'

const router = Router()

// ── POST /api/launch-circle/apply ──
router.post('/apply', (req, res) => {
  const { name, email, handle, revenue_stage, follower_range, challenge } = req.body

  // Validation
  const errors = []
  if (!name || !name.trim()) errors.push('Name is required.')
  if (!email || !email.trim()) errors.push('Email is required.')
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.push('Invalid email format.')
  if (!revenue_stage) errors.push('Revenue stage is required.')
  if (!follower_range) errors.push('Follower range is required.')
  if (!challenge || !challenge.trim()) errors.push('Challenge question is required.')

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(' ') })
  }

  const count = db.prepare('SELECT COUNT(*) as count FROM launch_circle_applications').get()
  if (count.count >= 30) {
    return res.status(200).json({
      success: false,
      waiting: true,
      message: 'All spots are currently filled. Your application has been added to the waitlist.',
    })
  }

  try {
    db.prepare(`
      INSERT INTO launch_circle_applications (name, email, handle, revenue_stage, follower_range, challenge)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      name.trim(),
      email.trim(),
      (handle || '').trim(),
      revenue_stage,
      follower_range,
      challenge.trim()
    )

    res.json({ success: true, message: 'Application received!' })
  } catch (e) {
    // Unique constraint or other DB error
    if (e.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'You have already applied with this email.' })
    }
    throw e
  }
})

// ── GET /api/launch-circle/count ──
router.get('/count', (_req, res) => {
  const { count } = db.prepare('SELECT COUNT(*) as count FROM launch_circle_applications').get()
  res.json({
    total: count,
    spots: 30,
    remaining: Math.max(0, 30 - count),
  })
})

// ── GET /api/launch-circle/applications ── admin endpoint
router.get('/applications', (_req, res) => {
  const apps = db.prepare(`
    SELECT id, name, email, handle, revenue_stage, follower_range, challenge, created_at
    FROM launch_circle_applications
    ORDER BY created_at DESC
  `).all()
  res.json(apps)
})

export default router
