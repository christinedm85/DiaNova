import { Router } from 'express'
import db from '../db.js'
import { authMiddleware, teamScope } from '../middleware.js'

const router = Router()
router.use(authMiddleware); router.use(teamScope)

function csv(headers, rows) {
  const escape = (v) => {
    if (v === null || v === undefined) return ''
    const s = String(v)
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  return [headers.join(','), ...rows.map(r => headers.map(h => escape(r[h])).join(','))].join('\n')
}

function sendCSV(res, filename, data) {
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  res.send(data)
}

// ── Sponsorships ─────────────────────────────────────────

router.get('/sponsorships', (req, res) => {
  const rows = db.prepare('SELECT id, brand, amount, status, notes, created_at FROM sponsorships WHERE user_id = ? ORDER BY created_at DESC').all(req.scopeUserId)
  sendCSV(res, 'sponsorships.csv', csv(['id', 'brand', 'amount', 'status', 'notes', 'created_at'], rows))
})

// ── Leads ────────────────────────────────────────────────

router.get('/leads', (req, res) => {
  const rows = db.prepare('SELECT id, name, email, source, created_at FROM leads WHERE user_id = ? ORDER BY created_at DESC').all(req.scopeUserId)
  sendCSV(res, 'leads.csv', csv(['id', 'name', 'email', 'source', 'created_at'], rows))
})

// ── Products ─────────────────────────────────────────────

router.get('/products', (req, res) => {
  const rows = db.prepare('SELECT id, title, type, price, sales, revenue, trend, created_at FROM products WHERE user_id = ? ORDER BY created_at DESC').all(req.scopeUserId)
  sendCSV(res, 'products.csv', csv(['id', 'title', 'type', 'price', 'sales', 'revenue', 'trend', 'created_at'], rows))
})

export default router
