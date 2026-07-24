import { Router } from 'express'
import db from '../db.js'
import { authMiddleware, teamScope } from '../middleware.js'

const router = Router()
router.use(authMiddleware); router.use(teamScope)

router.get('/sent', (req, res) => {
  res.json(db.prepare('SELECT * FROM sent_emails WHERE user_id = ? ORDER BY created_at DESC').all(req.scopeUserId))
})

router.get('/inbox', (req, res) => {
  res.json(db.prepare('SELECT * FROM inbox_messages WHERE user_id = ? ORDER BY received_at DESC').all(req.scopeUserId))
})

router.get('/unread', (req, res) => {
  const count = db.prepare('SELECT COUNT(*) as count FROM inbox_messages WHERE read = 0 AND user_id = ?').get(req.scopeUserId).count
  res.json({ unread: count })
})

router.put('/inbox/:id/read', (req, res) => {
  db.prepare('UPDATE inbox_messages SET read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.scopeUserId)
  const row = db.prepare('SELECT * FROM inbox_messages WHERE id = ? AND user_id = ?').get(req.params.id, req.scopeUserId)
  row ? res.json(row) : res.status(404).json({ error: 'Not found' })
})

router.post('/sent', (req, res) => {
  const { to_email, to_name, subject, body, type } = req.body
  const info = db.prepare('INSERT INTO sent_emails (to_email, to_name, subject, body, type, user_id) VALUES (?,?,?,?,?,?)')
    .run(to_email, to_name || '', subject, body, type || 'general', req.scopeUserId)
  res.status(201).json(db.prepare('SELECT * FROM sent_emails WHERE id = ?').get(info.lastInsertRowid))
})

router.post('/inbox', (req, res) => {
  const { message_id, from_email, from_name, subject, body } = req.body
  const existing = db.prepare('SELECT id FROM inbox_messages WHERE message_id = ? AND user_id = ?').get(message_id, req.scopeUserId)
  if (existing) return res.json({ exists: true, id: existing.id })
  const info = db.prepare('INSERT INTO inbox_messages (message_id, from_email, from_name, subject, body, user_id) VALUES (?,?,?,?,?,?)')
    .run(message_id, from_email, from_name || '', subject, body || '', req.scopeUserId)
  res.status(201).json(db.prepare('SELECT * FROM inbox_messages WHERE id = ?').get(info.lastInsertRowid))
})

export default router
