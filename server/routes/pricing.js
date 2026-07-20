import { Router } from 'express'
import db from '../db.js'

const router = Router()

router.get('/history', (_req, res) => {
  const rows = db.prepare('SELECT * FROM pricing_history ORDER BY id').all()
  res.json(rows)
})

router.post('/calculate', (req, res) => {
  const { subs, contentType } = req.body
  // Simple rate estimation based on subscriber count and content type
  const subsNum = parseInt(subs) || 100000
  let base = 0
  if (subsNum < 10000) base = 200
  else if (subsNum < 100000) base = 800
  else if (subsNum < 500000) base = 3000
  else base = 8000

  const multiplier = contentType === 'dedicated' ? 1.0 : contentType === 'integrated' ? 0.6 : 0.3
  const recommended = Math.round(base * multiplier)
  const low = Math.round(recommended * 0.7)
  const high = Math.round(recommended * 1.35)

  res.json({ low, recommended, high, currency: 'USD' })
})

export default router
