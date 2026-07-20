import { Router } from 'express'
import db from '../db.js'
import { authMiddleware, teamScope } from '../middleware.js'

const router = Router()
router.use(authMiddleware); router.use(teamScope)

router.get('/', (req, res) => {
  const q = req.query.q
  if (q) {
    const like = `%${q}%`
    res.json(db.prepare(
      'SELECT * FROM sponsorships WHERE user_id = ? AND (brand LIKE ? OR notes LIKE ? OR status LIKE ?) ORDER BY created_at DESC'
    ).all(req.scopeUserId, like, like, like))
  } else {
    res.json(db.prepare('SELECT * FROM sponsorships WHERE user_id = ? ORDER BY created_at DESC').all(req.scopeUserId))
  }
})

router.get('/pipeline', (req, res) => {
  const statuses = ['prospecting', 'negotiating', 'confirmed', 'completed']
  const result = {}
  for (const status of statuses) {
    result[status] = db.prepare('SELECT * FROM sponsorships WHERE status = ? AND user_id = ? ORDER BY updated_at DESC').all(status, req.scopeUserId)
  }
  res.json(result)
})

router.post('/', (req, res) => {
  const { brand, amount, status, notes } = req.body
  const stmt = db.prepare('INSERT INTO sponsorships (brand, amount, status, notes, user_id) VALUES (?, ?, ?, ?, ?)')
  const info = stmt.run(brand, amount, status || 'prospecting', notes || '', req.scopeUserId)

  // Track conversion
  db.prepare('INSERT INTO conversions (type, user_id, metadata) VALUES (?, ?, ?)').run('deal_created', req.user.id, JSON.stringify({ brand, amount }))

  const row = db.prepare('SELECT * FROM sponsorships WHERE id = ? AND user_id = ?').get(info.lastInsertRowid, req.scopeUserId)
  res.status(201).json(row)
})

router.put('/:id', (req, res) => {
  const { brand, amount, status, notes } = req.body
  const old = db.prepare('SELECT status, brand FROM sponsorships WHERE id = ? AND user_id = ?').get(req.params.id, req.scopeUserId)

  db.prepare(
    "UPDATE sponsorships SET brand = COALESCE(?, brand), amount = COALESCE(?, amount), status = COALESCE(?, status), notes = COALESCE(?, notes), updated_at = datetime('now') WHERE id = ? AND user_id = ?"
  ).run(brand, amount, status, notes, req.params.id, req.scopeUserId)
  const row = db.prepare('SELECT * FROM sponsorships WHERE id = ? AND user_id = ?').get(req.params.id, req.scopeUserId)

  if (row && status && old && old.status !== status) {
    // Notify on pipeline stage change
    const user = db.prepare('SELECT id, name, email, notify_deal_moved FROM users WHERE id = ?').get(req.user.id)
    if (user && user.notify_deal_moved) {
      const stages = { prospecting: 'Prospecting', negotiating: 'Negotiating', confirmed: 'Confirmed', completed: 'Completed' }
      db.prepare('INSERT INTO sent_emails (to_email, to_name, subject, body, type, user_id) VALUES (?,?,?,?,?,?)')
        .run(user.email, user.name,
          `📋 ${row.brand} moved to ${stages[status] || status}`,
          `Hi ${user.name},\n\nYour deal "${row.brand}" (${row.amount}) has moved to ${stages[status] || status}.\n\nView it in CreatorPilot: ${process.env.APP_URL || 'http://localhost:' + (process.env.PORT || 3001)}/\n\n— The CreatorPilot Team`,
          'deal-moved', user.id)
      console.log(`\n📨 Deal moved notification for ${user.email}: ${row.brand} → ${status}\n`)
    }
  }

  row ? res.json(row) : res.status(404).json({ error: 'Not found' })
})

router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM sponsorships WHERE id = ? AND user_id = ?').run(req.params.id, req.scopeUserId)
  info.changes ? res.json({ deleted: true }) : res.status(404).json({ error: 'Not found' })
})

export default router
