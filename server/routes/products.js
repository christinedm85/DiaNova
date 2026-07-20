import { Router } from 'express'
import db from '../db.js'
import { authMiddleware, teamScope } from '../middleware.js'

const router = Router()
router.use(authMiddleware); router.use(teamScope)

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM products WHERE user_id = ? ORDER BY revenue DESC').all(req.scopeUserId))
})

router.post('/', (req, res) => {
  const { title, type, price, sales, revenue, trend } = req.body
  const info = db.prepare('INSERT INTO products (title, type, price, sales, revenue, trend, user_id) VALUES (?,?,?,?,?,?,?)')
    .run(title, type, price, sales || 0, revenue || 0, trend || '0%', req.scopeUserId)
  res.status(201).json(db.prepare('SELECT * FROM products WHERE id=? AND user_id=?').get(info.lastInsertRowid, req.scopeUserId))
})

router.put('/:id', (req, res) => {
  const { title, type, price, sales, revenue, trend } = req.body
  db.prepare(`UPDATE products SET title=COALESCE(?,title), type=COALESCE(?,type), price=COALESCE(?,price), sales=COALESCE(?,sales), revenue=COALESCE(?,revenue), trend=COALESCE(?,trend) WHERE id=? AND user_id=?`)
    .run(title, type, price, sales, revenue, trend, req.params.id, req.scopeUserId)
  const row = db.prepare('SELECT * FROM products WHERE id=? AND user_id=?').get(req.params.id, req.scopeUserId)
  row ? res.json(row) : res.status(404).json({ error: 'Not found' })
})

router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM products WHERE id=? AND user_id=?').run(req.params.id, req.scopeUserId)
  info.changes ? res.json({ deleted: true }) : res.status(404).json({ error: 'Not found' })
})

export default router
