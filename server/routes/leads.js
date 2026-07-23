import { Router } from 'express'
import db from '../db.js'
import { authMiddleware, teamScope } from '../middleware.js'
import { sendEmail } from '../email.js'

const router = Router()
router.use(authMiddleware); router.use(teamScope)

router.get('/', (req, res) => {
  const q = req.query.q
  if (q) {
    const like = `%${q}%`
    res.json(db.prepare(
      'SELECT * FROM leads WHERE user_id = ? AND (name LIKE ? OR email LIKE ? OR source LIKE ?) ORDER BY created_at DESC'
    ).all(req.scopeUserId, like, like, like))
  } else {
    res.json(db.prepare('SELECT * FROM leads WHERE user_id = ? ORDER BY created_at DESC').all(req.scopeUserId))
  }
})

router.get('/stats', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as count FROM leads WHERE user_id = ?').get(req.scopeUserId).count
  res.json({ visitors: Math.round(total / 0.31), signups: Math.round(total), leads: total, qualified: Math.round(total * 0.4) })
})

router.post('/', (req, res) => {
  const { name, email, source } = req.body
  const info = db.prepare('INSERT INTO leads (name, email, source, user_id) VALUES (?, ?, ?, ?)').run(name, email, source || 'Direct', req.scopeUserId)

  // Track conversion
  db.prepare('INSERT INTO conversions (type, user_id, metadata) VALUES (?, ?, ?)').run('lead_captured', req.user.id, JSON.stringify({ name, source }))

  const row = db.prepare('SELECT * FROM leads WHERE id = ?').get(info.lastInsertRowid)

  // Notify on new lead
  const user = db.prepare('SELECT id, name, email, notify_new_lead FROM users WHERE id = ?').get(req.user.id)
  if (user && user.notify_new_lead) {
    void sendEmail(user.email, user.name,
      `🎯 New lead: ${name}`,
      `Hi ${user.name},\n\n${name} (${email}) just signed up via ${source || 'Direct'}.\n\nView all leads in CreatorBloom: ${process.env.APP_URL || 'http://localhost:' + (process.env.PORT || 3001)}/\n\n— The CreatorBloom Team`,
      'new-lead', user.id)
  }

  res.status(201).json(row)
})

router.put('/:id', (req, res) => {
  const { name, email, source } = req.body
  db.prepare('UPDATE leads SET name=COALESCE(?,name), email=COALESCE(?,email), source=COALESCE(?,source) WHERE id=? AND user_id=?')
    .run(name, email, source, req.params.id, req.scopeUserId)
  const row = db.prepare('SELECT * FROM leads WHERE id=? AND user_id=?').get(req.params.id, req.scopeUserId)
  row ? res.json(row) : res.status(404).json({ error: 'Not found' })
})

router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM leads WHERE id=? AND user_id=?').run(req.params.id, req.scopeUserId)
  info.changes ? res.json({ deleted: true }) : res.status(404).json({ error: 'Not found' })
})

export default router
