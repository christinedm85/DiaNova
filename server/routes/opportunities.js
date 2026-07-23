import { Router } from 'express'
import { authMiddleware, teamScope } from '../middleware.js'
import { askAI } from '../ai.js'

const router = Router()

// Auth + team scope
router.use(authMiddleware)
router.use(teamScope)

// GET /api/opportunities?niche=...
router.get('/', async (req, res) => {
  const niche = req.query.niche || 'general content creation'

  const prompt = `Generate 5-8 monetization opportunities for a content creator in the "${niche}" niche. 
Include a realistic mix of these types: brand_deal, seasonal, trend, affiliate, content_idea.
Make them specific and actionable — name real event types (like "Amazon Prime Day is coming up"), real brand categories ("skincare brand looking for TikTok creators"), real trends, etc.

Return ONLY valid JSON in this exact format:
{
  "opportunities": [
    {
      "id": "unique-string",
      "type": "brand_deal|seasonal|trend|affiliate|content_idea",
      "title": "headline string",
      "description": "2-3 sentence detail string",
      "category": "Brand Deal|Seasonal|Trend Alert|Affiliate|Content",
      "urgency": "high|medium|low",
      "actionLabel": "Pitch Now|Prepare|Learn More|Apply",
      "createdAt": "ISO timestamp"
    }
  ]
}

Rules:
- type "brand_deal" → category "Brand Deal", actionLabel "Pitch Now" or "Apply"
- type "seasonal" → category "Seasonal", actionLabel "Prepare" 
- type "trend" → category "Trend Alert", actionLabel "Learn More"
- type "affiliate" → category "Affiliate", actionLabel "Apply"
- type "content_idea" → category "Content", actionLabel "Learn More"
- urgency: "high" for time-sensitive, "medium" for this month, "low" for evergreen
- createdAt should be NOW (use current ISO timestamp)
- Make each opportunity unique and varied — don't repeat the same type twice if possible`

  const result = await askAI(prompt, 'You are a creator monetization expert. Generate realistic, specific monetization opportunities in JSON format. Return only valid JSON, no markdown.')

  if (result.error) {
    return res.status(500).json({ error: result.error })
  }

  try {
    let text = result.text
    if (text.startsWith('```')) {
      text = text.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '')
    }
    const parsed = JSON.parse(text)
    const opportunities = parsed.opportunities || parsed
    res.json(Array.isArray(opportunities) ? opportunities : [])
  } catch (e) {
    console.error('[opportunities] Parse error:', e.message)
    // Fallback: return raw text
    res.json([{
      id: 'fallback-1',
      type: 'content_idea',
      title: `Opportunities for ${niche} creators`,
      description: result.text.substring(0, 200),
      category: 'Content',
      urgency: 'medium',
      actionLabel: 'Learn More',
      createdAt: new Date().toISOString()
    }])
  }
})

export default router
