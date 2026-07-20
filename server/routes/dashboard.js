import { Router } from 'express'
import db from '../db.js'
import { authMiddleware, teamScope } from '../middleware.js'

const router = Router()
router.use(authMiddleware); router.use(teamScope)

router.get('/', (req, res) => {
  const sponsorTotal = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM sponsorships WHERE status IN ('confirmed', 'completed') AND user_id = ?").get(req.scopeUserId).total
  const sponsorCount = db.prepare("SELECT COUNT(*) as count FROM sponsorships WHERE status IN ('confirmed', 'negotiating') AND user_id = ?").get(req.scopeUserId).count
  const affRevenue = db.prepare('SELECT COALESCE(SUM(revenue), 0) as total FROM affiliates WHERE user_id = ?').get(req.scopeUserId).total
  const prodRevenue = db.prepare('SELECT COALESCE(SUM(revenue), 0) as total FROM products WHERE user_id = ?').get(req.scopeUserId).total

  const monthly = sponsorTotal + affRevenue + prodRevenue

  const recentDeals = db.prepare(
    "SELECT brand, amount, 'Sponsorship deal closed' as action, updated_at FROM sponsorships WHERE status = 'completed' AND user_id = ? ORDER BY updated_at DESC LIMIT 5"
  ).all(req.scopeUserId)

  const pipeline = {
    prospecting: db.prepare("SELECT COUNT(*) as count FROM sponsorships WHERE status = 'prospecting' AND user_id = ?").get(req.scopeUserId).count,
    negotiating: db.prepare("SELECT COUNT(*) as count FROM sponsorships WHERE status = 'negotiating' AND user_id = ?").get(req.scopeUserId).count,
    confirmed: db.prepare("SELECT COUNT(*) as count FROM sponsorships WHERE status = 'confirmed' AND user_id = ?").get(req.scopeUserId).count,
    completed: db.prepare("SELECT COUNT(*) as count FROM sponsorships WHERE status = 'completed' AND user_id = ?").get(req.scopeUserId).count,
  }

  res.json({
    monthly_revenue: monthly,
    active_sponsors: sponsorCount,
    affiliate_revenue: affRevenue,
    product_sales: prodRevenue,
    revenue_breakdown: { sponsorships: sponsorTotal, affiliates: affRevenue, products: prodRevenue, consulting: 1980 },
    pipeline,
    recent_activity: recentDeals,
  })
})

router.get('/trend', (req, res) => {
  const history = db.prepare('SELECT month, avg_rate FROM pricing_history ORDER BY id').all()
  const affRevenue = db.prepare('SELECT COALESCE(SUM(revenue), 0) as total FROM affiliates WHERE user_id = ?').get(req.scopeUserId).total
  const prodRevenue = db.prepare('SELECT COALESCE(SUM(revenue), 0) as total FROM products WHERE user_id = ?').get(req.scopeUserId).total

  const trend = history.map((h, i) => ({
    month: h.month,
    sponsorships: Math.round(h.avg_rate * (0.7 + Math.random() * 0.6)),
    affiliates: Math.round(affRevenue / history.length * (0.5 + i * 0.15)),
    products: Math.round(prodRevenue / history.length * (0.3 + i * 0.2)),
  }))
  res.json(trend)
})

export default router
