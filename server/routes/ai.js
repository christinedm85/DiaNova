import { Router } from 'express'
import { authMiddleware, teamScope } from '../middleware.js'
import { askAI } from '../ai.js'

const router = Router()

// All AI routes require auth + team scope
router.use(authMiddleware)
router.use(teamScope)

// Helper: try to parse JSON from AI response text, fallback to raw text
function parseAIResponse(result) {
  if (result.error) return result
  try {
    // Strip markdown code fences if present
    let text = result.text
    if (text.startsWith('```')) {
      text = text.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '')
    }
    return JSON.parse(text)
  } catch {
    return { raw: result.text }
  }
}

// ── 1. Pricing Suggestion ─────────────────────────────────
// POST /pricing-suggestion — body: {niche, dealType, pastAmounts[]}
router.post('/pricing-suggestion', async (req, res) => {
  const { niche, dealType, pastAmounts } = req.body
  if (!niche || !dealType) {
    return res.status(400).json({ error: 'niche and dealType are required' })
  }

  const prompt = `Suggest a rate range for a brand deal.
Niche: ${niche}
Deal type: ${dealType}
Past deal amounts: ${pastAmounts?.length ? pastAmounts.join(', ') : 'none provided'}
Return ONLY valid JSON: {"min": number, "max": number, "confidence": "low/medium/high", "reasoning": "string"}`

  const result = await askAI(prompt, 'You are a creator monetization expert. Suggest a rate range for a brand deal. Return JSON: {min, max, confidence, reasoning}')
  res.json(parseAIResponse(result))
})

// ── 2. Brand Match ────────────────────────────────────────
// POST /brand-match — body: {brandName, brandIndustry, creatorNiche}
router.post('/brand-match', async (req, res) => {
  const { brandName, brandIndustry, creatorNiche } = req.body
  if (!brandName || !brandIndustry || !creatorNiche) {
    return res.status(400).json({ error: 'brandName, brandIndustry, and creatorNiche are required' })
  }

  const prompt = `Score brand-creator fit.
Brand: ${brandName}
Brand industry: ${brandIndustry}
Creator niche: ${creatorNiche}
Return ONLY valid JSON: {"score": number (0-100), "tier": "Perfect|Good|Fair|Low", "reason": "string"}`

  const result = await askAI(prompt, 'Score brand-creator fit. Return JSON: {score (0-100), tier (Perfect/Good/Fair/Low), reason}')
  res.json(parseAIResponse(result))
})

// ── 3. Smart Follow-up ────────────────────────────────────
// POST /smart-followup — body: {brandName, stage, daysStale}
router.post('/smart-followup', async (req, res) => {
  const { brandName, stage, daysStale } = req.body
  if (!brandName || !stage) {
    return res.status(400).json({ error: 'brandName and stage are required' })
  }

  const prompt = `Suggest a follow-up action for a brand deal.
Brand: ${brandName}
Current stage: ${stage}
Days since last contact: ${daysStale ?? 'unknown'}
Return ONLY valid JSON: {"action": "string", "emailDraft": "string", "urgency": "low|medium|high"}`

  const result = await askAI(prompt, 'Suggest follow-up action. Return JSON: {action, emailDraft, urgency (low/medium/high)}')
  res.json(parseAIResponse(result))
})

// ── 4. Content Ideas ──────────────────────────────────────
// POST /content-ideas — body: {niche, audienceSize}
router.post('/content-ideas', async (req, res) => {
  const { niche, audienceSize } = req.body
  if (!niche) {
    return res.status(400).json({ error: 'niche is required' })
  }

  const prompt = `Suggest 3 digital product ideas for a creator.
Niche: ${niche}
Audience size: ${audienceSize ?? 'not specified'}
Return ONLY valid JSON: {"ideas": [{"title": "string", "description": "string", "price": number}]}`

  const result = await askAI(prompt, 'Suggest 3 digital product ideas. Return JSON: {ideas: [{title, description, price}]}')
  res.json(parseAIResponse(result))
})

// ── 5. Brand Discovery ────────────────────────────────────
// POST /brand-discovery — body: {niche, demographics}
router.post('/brand-discovery', async (req, res) => {
  const { niche, demographics } = req.body
  if (!niche) {
    return res.status(400).json({ error: 'niche is required' })
  }

  const prompt = `Suggest brand categories and specific brands to pitch for a creator.
Niche: ${niche}
Audience demographics: ${demographics ?? 'not specified'}
Return ONLY valid JSON: {"categories": [{"name": "string", "examples": ["string"], "outreachTemplate": "string"}]}`

  const result = await askAI(prompt, 'Suggest brand categories and brands to pitch. Return JSON: {categories: [{name, examples[], outreachTemplate}]}')
  res.json(parseAIResponse(result))
})

export default router
