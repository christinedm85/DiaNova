import { Router } from 'express'
import db from '../db.js'
import { authMiddleware, teamScope } from '../middleware.js'
import { askAI } from '../ai.js'

const router = Router()
router.use(authMiddleware)
router.use(teamScope)

router.get('/', async (req, res) => {
  const userId = req.scopeUserId

  // ── 1. Pull real user data ──────────────────────────────

  const sponsorships = db.prepare(
    'SELECT brand, amount, status, notes, updated_at FROM sponsorships WHERE user_id = ?'
  ).all(userId)

  const affiliateTotal = db.prepare(
    'SELECT COALESCE(SUM(revenue), 0) as total FROM affiliates WHERE user_id = ?'
  ).get(userId).total

  const productTotal = db.prepare(
    'SELECT COALESCE(SUM(revenue), 0) as total FROM products WHERE user_id = ?'
  ).get(userId).total

  const sponsorRevenue = db.prepare(
    "SELECT COALESCE(SUM(amount), 0) as total FROM sponsorships WHERE status IN ('confirmed', 'completed') AND user_id = ?"
  ).get(userId).total

  const monthlyRevenue = sponsorRevenue + affiliateTotal + productTotal

  const pipelinePotential = db.prepare(
    'SELECT COALESCE(SUM(amount), 0) as total FROM sponsorships WHERE user_id = ?'
  ).get(userId).total

  const overdueFollowUps = db.prepare(
    "SELECT COUNT(*) as count FROM sponsorships WHERE status IN ('prospecting', 'negotiating') AND user_id = ? AND updated_at < datetime('now', '-7 days')"
  ).get(userId).count

  // Pipeline breakdown by stage
  const pipelineStages = {}
  for (const stage of ['prospecting', 'negotiating', 'confirmed', 'completed']) {
    const count = db.prepare(
      'SELECT COUNT(*) as count FROM sponsorships WHERE status = ? AND user_id = ?'
    ).get(stage, userId).count
    const total = db.prepare(
      'SELECT COALESCE(SUM(amount), 0) as total FROM sponsorships WHERE status = ? AND user_id = ?'
    ).get(stage, userId).total
    pipelineStages[stage] = { count, total }
  }

  // Deal-level detail for AI
  const dealDetails = sponsorships.map(s => ({
    brand: s.brand,
    amount: s.amount,
    status: s.status,
    daysSinceUpdate: Math.floor((Date.now() - new Date(s.updated_at + 'Z').getTime()) / (1000 * 60 * 60 * 24))
  }))

  // ── 2. User greeting ────────────────────────────────────

  const user = db.prepare('SELECT name FROM users WHERE id = ?').get(req.user.id)
  const userName = user?.name || 'there'
  const hour = new Date().getHours()
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  const greeting = `Good ${timeOfDay}, ${userName}`

  // ── 3. Call AI for insights ─────────────────────────────

  const prompt = `Analyze this creator's business data and generate personalized, data-driven insights.

DATA:
- Monthly Revenue: $${monthlyRevenue.toLocaleString()}
- Pipeline Potential (all deals): $${pipelinePotential.toLocaleString()}
- Affiliate Revenue: $${affiliateTotal.toLocaleString()}
- Product Revenue: $${productTotal.toLocaleString()}
- Overdue Follow-ups: ${overdueFollowUps}
- Pipeline: Prospecting: ${pipelineStages.prospecting.count} deals ($${pipelineStages.prospecting.total.toLocaleString()}), Negotiating: ${pipelineStages.negotiating.count} deals ($${pipelineStages.negotiating.total.toLocaleString()}), Confirmed: ${pipelineStages.confirmed.count} deals ($${pipelineStages.confirmed.total.toLocaleString()}), Completed: ${pipelineStages.completed.count} deals ($${pipelineStages.completed.total.toLocaleString()})
- Deal details: ${JSON.stringify(dealDetails)}

Return ONLY valid JSON in this EXACT format — no markdown, no code fences:
{
  "insights": [
    {"type": "warning|alert|trend|opportunity", "message": "specific, actionable insight with numbers", "action": "short 2-3 word action label"},
    ...
  ],
  "forecast": {
    "nextMonth": 8400,
    "potentialIncrease": 18,
    "increaseAction": "Closing just one more sponsorship"
  }
}

RULES:
- 4-6 insights total. Cover all types that apply: warning (pricing/undervaluation), alert (overdue actions), trend (revenue patterns), opportunity (untapped potential)
- Use specific numbers and brand names from the data
- forecast.nextMonth: project next month based on current pipeline and trends (round to nearest hundred)
- forecast.potentialIncrease: integer percentage boost from closing ONE more deal
- forecast.increaseAction: brief phrase like "Closing just one more sponsorship" or "Raising your rates 15%"
- If all data is zero/empty, return empty insights array and forecast with zero increase
- Be encouraging and actionable, not alarming`

  const aiResult = await askAI(prompt,
    'You are a creator monetization expert and business analyst. Analyze the data and return ONLY valid JSON. Be specific, data-driven, and actionable.')

  let insights = []
  let forecast = {
    nextMonth: Math.max(monthlyRevenue, pipelineStages.confirmed.total + affiliateTotal + productTotal),
    potentialIncrease: 0,
    increaseAction: 'Build your pipeline'
  }

  if (!aiResult.error) {
    try {
      let text = aiResult.text
      // Strip markdown code fences if present
      if (text.startsWith('```')) {
        text = text.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '')
      }
      const parsed = JSON.parse(text)
      if (Array.isArray(parsed.insights)) insights = parsed.insights
      if (parsed.forecast) forecast = { ...forecast, ...parsed.forecast }
    } catch (e) {
      console.error('[insights] AI parse error:', e.message)
    }
  } else {
    console.error('[insights] AI error:', aiResult.error)
  }

  // ── 4. Fallback insights if AI produced nothing ──────────

  if (insights.length === 0) {
    if (overdueFollowUps > 0) {
      insights.push({
        type: 'alert',
        message: `You have ${overdueFollowUps} deal${overdueFollowUps > 1 ? 's' : ''} that need a follow-up`,
        action: 'Send follow-ups'
      })
    }
    if (pipelineStages.prospecting.count > 0 && pipelineStages.prospecting.total > 0) {
      insights.push({
        type: 'opportunity',
        message: `$${pipelineStages.prospecting.total.toLocaleString()} in early-stage deals — reach out to move them forward`,
        action: 'Move deals forward'
      })
    }
    if (pipelineStages.negotiating.count > 0) {
      insights.push({
        type: 'warning',
        message: `${pipelineStages.negotiating.count} deal${pipelineStages.negotiating.count > 1 ? 's are' : ' is'} in negotiation — review your pricing`,
        action: 'Review pricing'
      })
    }
    if (productTotal > 0 && affiliateTotal === 0) {
      insights.push({
        type: 'trend',
        message: 'Products are performing but affiliate revenue is untapped — diversify your income',
        action: 'View affiliates'
      })
    }
    if (monthlyRevenue === 0 && pipelinePotential === 0) {
      insights.push({
        type: 'opportunity',
        message: 'Connect your first sponsorship to unlock AI-powered insights and revenue forecasts',
        action: 'Add sponsorship'
      })
    }
  }

  // ── 5. Generate quick actions from insights ─────────────

  const iconMap = { warning: 'dollar', alert: 'mail', trend: 'chart', opportunity: 'package' }
  const routeMap = { warning: '/pricing', alert: '/sponsorships', trend: '/affiliates', opportunity: '/products' }

  const quickActions = insights.slice(0, 4).map(i => ({
    label: i.action,
    icon: iconMap[i.type] || 'zap',
    route: routeMap[i.type] || '/sponsorships'
  }))

  // ── 6. Return ───────────────────────────────────────────

  res.json({
    greeting,
    monthlyRevenue,
    pipelinePotential,
    followUpsDue: overdueFollowUps,
    insights,
    forecast,
    quickActions
  })
})

export default router
