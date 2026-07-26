import { Router } from 'express'
import db from '../db.js'
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

// ── 7. Creator Benchmarking ───────────────────────────────
// POST /creator-benchmarking — body: {niche?, audienceSize?, contentType}
router.post('/creator-benchmarking', async (req, res) => {
  const { niche, audienceSize, contentType } = req.body
  if (!contentType) {
    return res.status(400).json({ error: 'contentType is required' })
  }

  const contextParts = []
  if (niche) contextParts.push(`Creator's niche: ${niche}`)
  if (audienceSize) contextParts.push(`Audience size: ${audienceSize}`)
  const context = contextParts.length ? '\n\nContext:\n' + contextParts.join('\n') : ''

  const prompt = `Compare this creator's rates against the market for ${contentType}.${context}

Return ONLY valid JSON with this exact structure:
{
  "typicalRange": "$X – $Y (realistic market range string)",
  "yourPosition": "above_average|average|below_average",
  "percentile": number (0-100),
  "summary": "1-2 sentence summary with context about the niche and content type",
  "comparisons": [
    { "label": "Top 10%", "amount": "$X+", "gap": "+$Y from your current" },
    { "label": "Your range", "amount": "$X-$Y", "gap": null },
    { "label": "Bottom 25%", "amount": "$X-$Y", "gap": null }
  ]
}

Make the dollar amounts realistic for the niche and content type provided. If no niche or audience size is given, use reasonable industry averages.`

  const systemPrompt = 'You are a creator monetization expert who benchmarks creator rates against industry data. You provide realistic market rate comparisons for different content types and niches. Be specific with dollar amounts and always give actionable context.'

  const result = await askAI(prompt, systemPrompt)
  res.json(parseAIResponse(result))
})

// ── 8. Contract Scanner ────────────────────────────────────
// POST /contract-scanner — body: {contractText}
router.post('/contract-scanner', async (req, res) => {
  const { contractText } = req.body
  if (!contractText || typeof contractText !== 'string' || contractText.trim().length < 50) {
    return res.status(400).json({ error: 'contractText is required and must be at least 50 characters' })
  }

  const prompt = `Analyze this sponsorship contract for a content creator. Identify problematic clauses, missing protections, and provide a plain-English summary.

CONTRACT TEXT:
"""
${contractText}
"""

Return ONLY valid JSON with this exact structure:
{
  "clauses": [
    {
      "type": "exclusivity|usage_rights|payment_terms|termination|content_approval|deliverables|ownership|non_compete|other",
      "severity": "info|warning|danger",
      "detail": "Clear, plain-English explanation of what this clause means and why it matters"
    }
  ],
  "missing": [
    "Brief description of a missing protection that should be in the contract"
  ],
  "summary": "1-3 sentence overall assessment highlighting the most important concerns"
}

Rules:
- severity: "info" for standard/expected clauses, "warning" for restrictive but common clauses, "danger" for clauses that could harm the creator
- Focus on what actually matters: unfair payment terms, excessive exclusivity, loss of content ownership, vague deliverables
- Only flag real issues — don't fabricate problems
- "missing" should list protections that are genuinely absent (minimum 0, maximum 5)`

  const systemPrompt = 'You are a legal analyst specializing in creator/sponsor contracts. You translate legal jargon into plain English and flag clauses that could harm content creators. Be practical, specific, and focus on real risks. You are NOT providing legal advice — you are an AI assistant helping creators understand what they are signing.'

  const result = await askAI(prompt, systemPrompt)
  const parsed = parseAIResponse(result)

  // Add disclaimer to every response
  if (!parsed.error && !parsed.raw) {
    parsed._disclaimer = '⚠️ This is AI-generated analysis, not legal advice. Always have a lawyer review contracts before signing.'
  }
  res.json(parsed)
})

// ── 6. Negotiation Coach ──────────────────────────────────
// POST /negotiation-coach — body: {emailText, niche?, audienceSize?}
router.post('/negotiation-coach', async (req, res) => {
  const { emailText, niche, audienceSize } = req.body
  if (!emailText || typeof emailText !== 'string' || emailText.trim().length < 20) {
    return res.status(400).json({ error: 'emailText is required and must be at least 20 characters' })
  }

  const contextParts = []
  if (niche) contextParts.push(`Creator's niche: ${niche}`)
  if (audienceSize) contextParts.push(`Audience size: ${audienceSize}`)
  const context = contextParts.length ? '\n\nCreator context:\n' + contextParts.join('\n') : ''

  const prompt = `Analyze this brand offer email and provide a negotiation coaching response.${context}

BRAND EMAIL:
"""
${emailText}
"""

Return ONLY valid JSON with this exact structure:
{
  "fairness": {
    "rating": "underpriced|fair|overpriced",
    "summary": "1-2 sentence assessment of the offer's fairness"
  },
  "counteroffer": {
    "suggestedRange": "$X - $Y",
    "rationale": "1-2 sentence explanation of the suggested range"
  },
  "negotiationTips": [
    "Specific actionable tip 1",
    "Specific actionable tip 2",
    "Specific actionable tip 3"
  ],
  "draftReply": "Professional email draft reply that the creator can send back",
  "redFlags": [
    "Specific red flag with explanation",
    "Another red flag with explanation"
  ]
}`

  const systemPrompt = `You are a creator monetization expert who coaches content creators through brand deal negotiations. You analyze brand offers and provide actionable counteroffer strategies, negotiation tips, draft replies, and red flag detection. Be specific, data-driven when possible, and always err on the side of protecting the creator's interests.`

  const result = await askAI(prompt, systemPrompt)
  const parsed = parseAIResponse(result)

  // Add disclaimer to every response
  if (!parsed.error && !parsed.raw) {
    parsed._disclaimer = '⚠️ This is AI-generated guidance, not legal advice. Review contracts with a lawyer before signing.'
  }
  res.json(parsed)
})

// ── 9. Ask Bloom — Natural language chat ──────────────────
// POST /ask-bloom — body: { question, conversationHistory[] }
router.post('/ask-bloom', async (req, res) => {
  const { question, conversationHistory } = req.body
  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'question is required' })
  }

  // Gather full user context
  const userId = req.scopeUserId
  const sponsorships = db.prepare(
    "SELECT brand, amount, status, stage, updated_at FROM sponsorships WHERE user_id = ? ORDER BY amount DESC"
  ).all(userId)

  const pipeline = {
    prospecting: sponsorships.filter(s => s.status === 'prospecting').length,
    negotiating: sponsorships.filter(s => s.status === 'negotiating').length,
    confirmed: sponsorships.filter(s => s.status === 'confirmed').length,
    completed: sponsorships.filter(s => s.status === 'completed').length,
  }

  const topDeals = sponsorships
    .filter(s => s.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  const confirmedDeals = sponsorships.filter(s => s.status === 'confirmed' || s.status === 'completed')
  const avgDealSize = confirmedDeals.length > 0
    ? Math.round(confirmedDeals.reduce((sum, s) => sum + (s.amount || 0), 0) / confirmedDeals.length)
    : 0

  const sponsorTotal = db.prepare(
    "SELECT COALESCE(SUM(amount), 0) as total FROM sponsorships WHERE status IN ('confirmed', 'completed') AND user_id = ?"
  ).get(userId).total

  const affRevenue = db.prepare('SELECT COALESCE(SUM(revenue), 0) as total FROM affiliates WHERE user_id = ?').get(userId).total
  const prodRevenue = db.prepare('SELECT COALESCE(SUM(revenue), 0) as total FROM products WHERE user_id = ?').get(userId).total
  const monthlyRevenue = sponsorTotal + affRevenue + prodRevenue

  const activeSponsors = db.prepare(
    "SELECT COUNT(*) as count FROM sponsorships WHERE status IN ('confirmed', 'negotiating') AND user_id = ?"
  ).get(userId).count

  const followUpsDue = db.prepare(
    "SELECT COUNT(*) as count FROM sponsorships WHERE follow_up_due = 1 AND user_id = ?"
  ).get(userId).count

  // Check integration statuses
  let youtubeConnected = false
  let metaConnected = false
  let tiktokConnected = false
  try {
    youtubeConnected = !!db.prepare("SELECT 1 FROM youtube_tokens WHERE user_id = ?").get(userId)
  } catch {}
  try {
    metaConnected = !!db.prepare("SELECT 1 FROM meta_tokens WHERE user_id = ?").get(userId)
  } catch {}
  try {
    tiktokConnected = !!db.prepare("SELECT 1 FROM tiktok_tokens WHERE user_id = ?").get(userId)
  } catch {}

  // Build context summary
  const contextParts = [`## Creator's Business Context

**Revenue:** ${monthlyRevenue.toLocaleString()} monthly (sponsorships: ${sponsorTotal.toLocaleString()}, affiliates: ${affRevenue.toLocaleString()}, products: ${prodRevenue.toLocaleString()})
**Active sponsors:** ${activeSponsors}
**Pipeline:** Prospecting: ${pipeline.prospecting}, Negotiating: ${pipeline.negotiating}, Confirmed: ${pipeline.confirmed}, Completed: ${pipeline.completed}
**Average deal size:** ${avgDealSize.toLocaleString()}
**Follow-ups due:** ${followUpsDue}`]

  if (topDeals.length > 0) {
    contextParts.push(`\n**Top Deals:**\n${topDeals.map(d => `- ${d.brand}: ${(d.amount || 0).toLocaleString()} (${d.status})`).join('\n')}`)
  }

  contextParts.push(`\n**Integrations Connected:** YouTube: ${youtubeConnected ? 'Yes' : 'No'}, Meta: ${metaConnected ? 'Yes' : 'No'}, TikTok: ${tiktokConnected ? 'Yes' : 'No'}`)

  const contextStr = contextParts.join('\n')

  // Build system prompt
  const systemPrompt = `You are Bloom, an AI copilot for content creators on CreatorBloom. You help creators run their business — sponsorships, affiliate marketing, pricing, brand building, product sales, and content strategy.

You have access to the creator's real business data. Use it to give specific, personalized advice. When asked about deals, pricing, or strategy, reference actual numbers from their account.

${contextStr}

Guidelines:
- Be warm, encouraging, and conversational. Use emojis sparingly but naturally 🌸
- Reference the creator's actual data when relevant (specific brands, amounts, pipeline numbers)
- When the creator asks "what should I do today" or "what's most important," prioritize follow-ups and high-value deals
- If you can't answer something or need more data, suggest connecting integrations (YouTube, Meta, TikTok)
- Keep responses concise — 2-4 sentences usually, longer only when explaining strategy
- Never make up numbers or brands — only reference data provided
- If you suggest a rate or price, explain your reasoning based on their deal history`

  // Build messages array
  const messages = [{ role: 'system', content: systemPrompt }]

  // Add conversation history (last 10 exchanges to stay within budget)
  if (Array.isArray(conversationHistory)) {
    const recent = conversationHistory.slice(-10)
    for (const msg of recent) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({ role: msg.role, content: msg.content })
      }
    }
  }

  // Add current question
  messages.push({ role: 'user', content: question })

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages, temperature: 0.7, max_tokens: 600 })
    })
    const json = await openaiRes.json()
    if (!openaiRes.ok) {
      console.error('[ask-bloom] OpenAI error:', json)
      return res.status(502).json({ error: json.error?.message || 'AI request failed' })
    }

    const responseText = json.choices[0].message.content.trim()

    // Suggest possible follow-up actions based on the question
    const actionSuggestions = []
    const lowerQ = question.toLowerCase()
    if (lowerQ.includes('deal') || lowerQ.includes('accept') || lowerQ.includes('offer')) {
      actionSuggestions.push({ label: 'View Sponsorships', route: 'sponsorships' })
    }
    if (lowerQ.includes('charge') || lowerQ.includes('price') || lowerQ.includes('rate')) {
      actionSuggestions.push({ label: 'Smart Pricing', route: 'pricing' })
    }
    if (lowerQ.includes('revenue') || lowerQ.includes('money') || lowerQ.includes('income')) {
      actionSuggestions.push({ label: 'View Dashboard', route: 'dashboard' })
    }
    if (lowerQ.includes('content') || lowerQ.includes('video') || lowerQ.includes('post')) {
      actionSuggestions.push({ label: 'Content Ideas', route: 'intelligence' })
    }

    res.json({
      response: responseText,
      actions: actionSuggestions.length > 0 ? actionSuggestions : undefined,
    })
  } catch (e) {
    console.error('[ask-bloom] Error:', e)
    res.status(500).json({ error: 'Failed to get response' })
  }
})

export default router
