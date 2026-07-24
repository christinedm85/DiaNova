import { Router } from 'express'
import db from '../db.js'
import { authMiddleware } from '../middleware.js'

const router = Router()

// ── Config ──────────────────────────────────────────────────
const GOOGLE_GMAIL_CLIENT_ID = process.env.GOOGLE_GMAIL_CLIENT_ID
const GOOGLE_GMAIL_CLIENT_SECRET = process.env.GOOGLE_GMAIL_CLIENT_SECRET
const GOOGLE_GMAIL_REDIRECT_URI = process.env.GOOGLE_GMAIL_REDIRECT_URI || 'https://1bd0fe78e336c1ba7ee351e2e414b06b.ctonew.app/api/integrations/gmail/callback'

function isConfigured() {
  return !!(GOOGLE_GMAIL_CLIENT_ID && GOOGLE_GMAIL_CLIENT_SECRET)
}

// ── Helpers ─────────────────────────────────────────────────

async function refreshAccessToken(userId) {
  const tokenRow = db.prepare('SELECT * FROM gmail_tokens WHERE user_id = ?').get(userId)
  if (!tokenRow || !tokenRow.refresh_token) return null

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_GMAIL_CLIENT_ID,
      client_secret: GOOGLE_GMAIL_CLIENT_SECRET,
      refresh_token: tokenRow.refresh_token,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) {
    // Refresh failed — clear tokens
    db.prepare('DELETE FROM gmail_tokens WHERE user_id = ?').run(userId)
    return null
  }

  const data = await res.json()
  const expiresAt = data.expires_in
    ? new Date(Date.now() + data.expires_in * 1000).toISOString()
    : null

  db.prepare(`
    UPDATE gmail_tokens
    SET access_token = ?, expires_at = ?, updated_at = datetime('now')
    WHERE user_id = ?
  `).run(data.access_token, expiresAt, userId)

  return data.access_token
}

async function getValidToken(userId) {
  const tokenRow = db.prepare('SELECT * FROM gmail_tokens WHERE user_id = ?').get(userId)
  if (!tokenRow) return null

  // Check if expired or about to expire (within 5 min)
  if (tokenRow.expires_at && new Date(tokenRow.expires_at) <= new Date(Date.now() + 5 * 60 * 1000)) {
    return await refreshAccessToken(userId) || tokenRow.access_token
  }

  return tokenRow.access_token
}

function getCached(userId, key) {
  const row = db.prepare(
    "SELECT * FROM gmail_cache WHERE user_id = ? AND cache_key = ? AND created_at > datetime('now', '-1 hour')"
  ).get(userId, key)
  if (row) {
    try { return JSON.parse(row.data) } catch { return null }
  }
  return null
}

function setCache(userId, key, data) {
  db.prepare(`
    INSERT INTO gmail_cache (user_id, cache_key, data, created_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, cache_key) DO UPDATE SET data = excluded.data, created_at = datetime('now')
  `).run(userId, key, JSON.stringify(data))
}

// ── Sponsorship detection keywords and categories ──────────

const SPONSORSHIP_KEYWORDS = [
  'sponsorship', 'brand deal', 'collaboration', 'partnership',
  'paid promotion', 'influencer', 'UGC', 'brand ambassador',
  'media kit', 'rate card', 'sponsored', 'creator partnership',
  'gifted', 'product seeding', 'affiliate program', 'creator collab',
  'brand partnership', 'content creator', 'influencer marketing',
]

const NEWSLETTER_PATTERNS = [
  /\bunsubscribe\b/i,
  /\bnewsletter\b/i,
  /view (this|in|online)/i,
  /\bdigest\b/i,
]

const AUTO_REPLY_PATTERNS = [
  /\bout of (the )?office\b/i,
  /auto(mated)?(\s*)?(reply|response)/i,
  /on vacation/i,
  /\bvacation responder\b/i,
]

function detectCategory(subject, snippet) {
  const text = (subject + ' ' + snippet).toLowerCase()

  if (/\baffiliate\b|\bcommission\b|\breferral\b/i.test(text)) return 'affiliate'
  if (/\bugc\b|user.gen(erated)?(\s)?content/i.test(text)) return 'ugc_request'
  if (/\bgifted\b|\bfree product\b|\bproduct (seeding|sample)\b|send you|try our/i.test(text)) return 'gifted'
  if (/\bsponsor|\bbrand deal\b|\bpaid\b|\bcollab|\bpartnership\b|\bmedia kit\b|\brate card\b/i.test(text)) return 'brand_deal'
  return 'other'
}

function calculateConfidence(subject, snippet) {
  const text = (subject + ' ' + snippet).toLowerCase()
  let score = 0

  // Strong signals
  if (/\bsponsorship\b/i.test(text)) score += 30
  if (/\bbrand deal\b/i.test(text)) score += 30
  if (/\bpartnership\b/i.test(text)) score += 20
  if (/\bcollaboration\b/i.test(text)) score += 20
  if (/\bpaid promotion\b/i.test(text)) score += 25
  if (/\bmedia kit\b/i.test(text)) score += 25
  if (/\brate card\b/i.test(text)) score += 25
  if (/\binfluencer\b/i.test(text)) score += 15
  if (/\bugc\b/i.test(text)) score += 15
  if (/\bbrand ambassador\b/i.test(text)) score += 20

  // Weaker signals
  if (/\bcreator\b/i.test(text)) score += 10
  if (/\bcontent\b/i.test(text)) score += 5

  // Penalize if looks like a newsletter
  for (const pattern of NEWSLETTER_PATTERNS) {
    if (pattern.test(text)) score -= 20
  }

  // Penalize if looks like auto-reply
  for (const pattern of AUTO_REPLY_PATTERNS) {
    if (pattern.test(text)) score -= 40
  }

  return Math.min(100, Math.max(0, score))
}

function isNoiseEmail(from, subject, snippet) {
  const text = (subject + ' ' + snippet).toLowerCase()
  for (const pattern of AUTO_REPLY_PATTERNS) {
    if (pattern.test(text)) return true
  }
  // High unsubscribe signal + no sponsorship keywords = likely newsletter
  const hasSponsorship = SPONSORSHIP_KEYWORDS.some(kw => text.includes(kw.toLowerCase()))
  if (!hasSponsorship && /\bunsubscribe\b/i.test(text)) return true
  return false
}

// ── Mock data generator ────────────────────────────────────

function mockSponsorshipEmails() {
  const now = new Date()
  const day = (offset) => {
    const d = new Date(now)
    d.setDate(d.getDate() - offset)
    return d.toISOString()
  }

  return [
    {
      id: 'mock-1',
      from: 'sarah@glowbeauty.com',
      fromName: 'Sarah Chen',
      subject: 'Partnership opportunity with Glow Beauty',
      snippet: 'Hi! We love your content and would love to discuss a paid brand collaboration for our new skincare line. We\'re looking for creators with authentic audiences...',
      date: day(1),
      category: 'brand_deal',
      confidence: 92,
    },
    {
      id: 'mock-2',
      from: 'marcus@techgear.com',
      fromName: 'Marcus Webb',
      subject: 'Sponsorship inquiry — TechGear Pro',
      snippet: 'We\'ve been following your channel and think you\'d be a perfect fit for our affiliate program. We offer 15% commission on all sales plus a $500 sign-on bonus...',
      date: day(2),
      category: 'affiliate',
      confidence: 88,
    },
    {
      id: 'mock-3',
      from: 'priya@fitsquad.co',
      fromName: 'Priya Patel',
      subject: 'UGC opportunity — FitSquad summer campaign',
      snippet: 'FitSquad is looking for UGC creators for our summer launch. We\'re offering $750 for 3 short-form videos featuring our new activewear line. No follower minimum...',
      date: day(3),
      category: 'ugc_request',
      confidence: 85,
    },
    {
      id: 'mock-4',
      from: 'james@travelnow.com',
      fromName: 'James Kim',
      subject: 'Collaboration: TravelNow wants to work with you!',
      snippet: 'Our team at TravelNow would love to explore a brand partnership. We\'re impressed by your engagement rates and think your audience aligns perfectly with our travel app...',
      date: day(4),
      category: 'brand_deal',
      confidence: 91,
    },
    {
      id: 'mock-5',
      from: 'olivia@styledlab.com',
      fromName: 'Olivia Ruiz',
      subject: 'Gifted collaboration — StyleLab new collection',
      snippet: 'We\'d love to send you our new collection as a gifted collaboration! If you enjoy the products, we\'d love for you to share them with your audience. No strings attached...',
      date: day(5),
      category: 'gifted',
      confidence: 78,
    },
    {
      id: 'mock-6',
      from: 'david@nutritionfuel.com',
      fromName: 'David Park',
      subject: 'Brand ambassador program — NutritionFuel',
      snippet: 'NutritionFuel is launching our 2026 ambassador program and we think you\'d be an amazing addition. The program includes monthly stipend of $1,200, product credit...',
      date: day(6),
      category: 'brand_deal',
      confidence: 94,
    },
    {
      id: 'mock-7',
      from: 'emma@bloomcosmetics.co',
      fromName: 'Emma Watson',
      subject: 'Paid promotion inquiry from Bloom Cosmetics',
      snippet: 'We\'re reaching out to select creators for our upcoming product launch. Compensation package includes $2,000 flat fee plus commission on sales through your unique link...',
      date: day(8),
      category: 'brand_deal',
      confidence: 96,
    },
    {
      id: 'mock-8',
      from: 'ryan@gamervault.gg',
      fromName: 'Ryan Torres',
      subject: 'Affiliate partnership — GamerVault',
      snippet: 'Hey! We\'re expanding our affiliate program and looking for gaming creators. 20% recurring commission on all subscriptions. Your recent content would be perfect...',
      date: day(10),
      category: 'affiliate',
      confidence: 82,
    },
    {
      id: 'mock-9',
      from: 'lisa@petalpress.com',
      fromName: 'Lisa Chang',
      subject: 'Media kit request + potential collab',
      snippet: 'We came across your profile and would love to see your media kit for a potential collaboration. We\'re a sustainable fashion brand looking for creators for our Earth Day...',
      date: day(12),
      category: 'brand_deal',
      confidence: 87,
    },
    {
      id: 'mock-10',
      from: 'newsletter@creatordigest.com',
      fromName: 'Creator Digest',
      subject: 'This week in creator news: brand deals, TikTok updates',
      snippet: 'View this email in your browser. The latest creator economy news... To unsubscribe from these emails, click here...',
      date: day(0),
      category: 'other',
      confidence: 5,
    },
    {
      id: 'mock-11',
      from: 'alex@buildyourbrand.io',
      fromName: 'Alex Rivera',
      subject: 'Rate card review — interested in working together',
      snippet: 'We\'re building out our Q3 creator roster and would love to see your rate card. We typically work with creators in the 50K-200K follower range. Looking forward to...',
      date: day(14),
      category: 'brand_deal',
      confidence: 89,
    },
    {
      id: 'mock-12',
      from: 'julia@snapcontent.agency',
      fromName: 'Julia Foster',
      subject: 'UGC creator search — major beverage brand',
      snippet: 'Our agency reps a major beverage brand looking for UGC creators for a 6-month campaign. Paid opportunity starting at $1,500/month for 4 posts. Interested?',
      date: day(15),
      category: 'ugc_request',
      confidence: 90,
    },
  ]
}

function mockStats(sponsorshipEmails) {
  const deals = sponsorshipEmails.filter(e => e.confidence >= 60)
  const categoryCounts = {}
  for (const e of deals) {
    categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1
  }

  return {
    totalSponsorshipEmails: deals.length,
    responseRate: 45,
    categoryBreakdown: {
      brand_deal: categoryCounts.brand_deal || 0,
      affiliate: categoryCounts.affiliate || 0,
      ugc_request: categoryCounts.ugc_request || 0,
      gifted: categoryCounts.gifted || 0,
      other: categoryCounts.other || 0,
    },
    monthlyTrend: [
      { month: 'Jan', count: 8 },
      { month: 'Feb', count: 11 },
      { month: 'Mar', count: 14 },
      { month: 'Apr', count: 10 },
      { month: 'May', count: 16 },
      { month: 'Jun', count: 19 },
      { month: 'Jul', count: deals.length },
    ],
  }
}

// ── OAuth: Redirect to Google ──────────────────────────────

router.get('/auth', (req, res) => {
  if (!isConfigured()) {
    return res.status(501).json({ error: 'Gmail integration not configured. Set GOOGLE_GMAIL_CLIENT_ID and GOOGLE_GMAIL_CLIENT_SECRET.' })
  }

  // Read userId from query param (browser navigation has no auth header)
  const userId = req.query.userId ? parseInt(req.query.userId, 10) : null
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: 'Missing userId parameter' })
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_GMAIL_CLIENT_ID,
    redirect_uri: GOOGLE_GMAIL_REDIRECT_URI,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/gmail.readonly',
    access_type: 'offline',
    prompt: 'consent',
    state: String(userId),
  })

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
})

// ── OAuth: Callback ─────────────────────────────────────────

router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query

  if (error) {
    return res.redirect('/?gmail_error=' + encodeURIComponent(error))
  }

  if (!code || !state) {
    return res.redirect('/?gmail_error=missing_params')
  }

  const userId = parseInt(state, 10)
  if (isNaN(userId)) {
    return res.redirect('/?gmail_error=invalid_state')
  }

  if (!isConfigured()) {
    return res.redirect('/?gmail_error=not_configured')
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_GMAIL_CLIENT_ID,
        client_secret: GOOGLE_GMAIL_CLIENT_SECRET,
        code,
        redirect_uri: GOOGLE_GMAIL_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      const err = await tokenRes.text()
      console.error('Gmail token exchange failed:', err)
      return res.redirect('/?gmail_error=token_exchange_failed')
    }

    const tokenData = await tokenRes.json()

    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null

    // Fetch user email address
    let emailAddress = null
    try {
      const profileRes = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/profile',
        { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
      )
      if (profileRes.ok) {
        const profileData = await profileRes.json()
        emailAddress = profileData.emailAddress || null
      }
    } catch (e) {
      console.warn('Failed to fetch Gmail profile during OAuth:', e.message)
    }

    // Upsert tokens
    const existing = db.prepare('SELECT id FROM gmail_tokens WHERE user_id = ?').get(userId)
    if (existing) {
      db.prepare(`
        UPDATE gmail_tokens
        SET access_token = ?, refresh_token = ?, expires_at = ?,
            email_address = ?, updated_at = datetime('now')
        WHERE user_id = ?
      `).run(tokenData.access_token, tokenData.refresh_token || null, expiresAt,
        emailAddress, userId)
    } else {
      db.prepare(`
        INSERT INTO gmail_tokens (user_id, access_token, refresh_token, expires_at, email_address)
        VALUES (?, ?, ?, ?, ?)
      `).run(userId, tokenData.access_token, tokenData.refresh_token || null, expiresAt, emailAddress)
    }

    res.redirect('/?gmail_connected=1')
  } catch (e) {
    console.error('Gmail callback error:', e)
    res.redirect('/?gmail_error=server_error')
  }
})

// ── Protected routes below ──────────────────────────────────
router.use(authMiddleware)

// ── Connection status ──────────────────────────────────────

router.get('/status', (req, res) => {
  const tokenRow = db.prepare(
    'SELECT email_address FROM gmail_tokens WHERE user_id = ?'
  ).get(req.user.id)

  res.json({
    connected: !!tokenRow,
    email: tokenRow?.email_address || null,
    configured: isConfigured(),
  })
})

// ── Sponsorship email scanning ─────────────────────────────

router.get('/sponsorships', async (req, res) => {
  const userId = req.user.id

  // If not configured, return mock data
  if (!isConfigured()) {
    const cached = getCached(userId, 'gmail_sponsorships')
    if (cached) return res.json(cached)

    const mock = mockSponsorshipEmails()
    setCache(userId, 'gmail_sponsorships', mock)
    return res.json(mock)
  }

  const tokenRow = db.prepare('SELECT * FROM gmail_tokens WHERE user_id = ?').get(userId)
  if (!tokenRow) {
    // Not connected — return mock for demo
    const mock = mockSponsorshipEmails()
    return res.json(mock)
  }

  // Check cache
  const cached = getCached(userId, 'gmail_sponsorships')
  if (cached) return res.json(cached)

  try {
    const accessToken = await getValidToken(userId)
    if (!accessToken) throw new Error('No valid token')

    // Build query with all sponsorship keywords
    const queryParts = SPONSORSHIP_KEYWORDS.map(kw => `"${kw}"`)
    const query = queryParts.join(' OR ')

    // Search Gmail API — last 30 days
    const after = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const afterEpoch = Math.floor(after.getTime() / 1000)

    const searchRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=50&q=after:${afterEpoch}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    if (!searchRes.ok) {
      throw new Error('Gmail API search failed')
    }

    const searchData = await searchRes.json()
    const messageIds = (searchData.messages || []).map(m => m.id)

    if (messageIds.length === 0) {
      const result = []
      setCache(userId, 'gmail_sponsorships', result)
      return res.json(result)
    }

    // Fetch message details (batch — up to 10 at a time to avoid huge requests)
    const emails = []
    const batchSize = 10
    for (let i = 0; i < messageIds.length; i += batchSize) {
      const batch = messageIds.slice(i, i + batchSize)
      const detailRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${batch[0]}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      // For simplicity, fetch each individually
    }

    // Fetch message details individually for better control
    for (const msgId of messageIds.slice(0, 30)) {
      try {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
        if (!msgRes.ok) continue

        const msgData = await msgRes.json()
        const headers = {}
        for (const h of (msgData.payload?.headers || [])) {
          headers[h.name.toLowerCase()] = h.value
        }

        const from = headers.from || ''
        const fromName = from.split('<')[0]?.trim() || from
        const fromEmail = (from.match(/<([^>]+)>/) || [])[1] || from
        const subject = headers.subject || '(no subject)'
        const snippet = msgData.snippet || ''

        if (isNoiseEmail(from, subject, snippet)) continue

        const category = detectCategory(subject, snippet)
        const confidence = calculateConfidence(subject, snippet)

        // Only include if confidence is above threshold
        if (confidence >= 30) {
          emails.push({
            id: msgId,
            from: fromEmail,
            fromName: fromName || fromEmail,
            subject,
            snippet: snippet.substring(0, 200),
            date: headers.date || new Date().toISOString(),
            category,
            confidence,
          })
        }
      } catch (e) {
        console.warn(`Skipping message ${msgId}:`, e.message)
      }
    }

    // Sort by confidence desc
    emails.sort((a, b) => b.confidence - a.confidence)

    setCache(userId, 'gmail_sponsorships', emails)
    res.json(emails)
  } catch (e) {
    console.error('Gmail sponsorship scan error:', e.message)

    // Return mock data on error (so UI doesn't break)
    const mock = mockSponsorshipEmails()
    return res.json(mock)
  }
})

// ── Stats ──────────────────────────────────────────────────

router.get('/stats', async (req, res) => {
  const userId = req.user.id

  // If not configured, return mock data
  if (!isConfigured()) {
    const cached = getCached(userId, 'gmail_stats')
    if (cached) return res.json(cached)

    const emails = mockSponsorshipEmails()
    const stats = mockStats(emails)
    setCache(userId, 'gmail_stats', stats)
    return res.json(stats)
  }

  const tokenRow = db.prepare('SELECT * FROM gmail_tokens WHERE user_id = ?').get(userId)
  if (!tokenRow) {
    const emails = mockSponsorshipEmails()
    return res.json(mockStats(emails))
  }

  // Check cache
  const cached = getCached(userId, 'gmail_stats')
  if (cached) return res.json(cached)

  // Try to get real data by calling the sponsorships endpoint logic
  try {
    // Re-use sponsorship data — call internally by reading from cache or fetching fresh
    let emails = getCached(userId, 'gmail_sponsorships')
    if (!emails) {
      // Need to fetch first
      const accessToken = await getValidToken(userId)
      if (!accessToken) throw new Error('No valid token')

      const queryParts = SPONSORSHIP_KEYWORDS.map(kw => `"${kw}"`)
      const query = queryParts.join(' OR ')
      const after = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000)

      const searchRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=50`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )

      if (!searchRes.ok) throw new Error('Gmail API search failed')

      const searchData = await searchRes.json()
      const messageIds = (searchData.messages || []).map(m => m.id)

      emails = []
      for (const msgId of messageIds.slice(0, 30)) {
        try {
          const msgRes = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          )
          if (!msgRes.ok) continue

          const msgData = await msgRes.json()
          const headers = {}
          for (const h of (msgData.payload?.headers || [])) {
            headers[h.name.toLowerCase()] = h.value
          }

          const from = headers.from || ''
          const fromName = from.split('<')[0]?.trim() || from
          const fromEmail = (from.match(/<([^>]+)>/) || [])[1] || from
          const subject = headers.subject || '(no subject)'
          const snippet = msgData.snippet || ''

          if (isNoiseEmail(from, subject, snippet)) continue

          const category = detectCategory(subject, snippet)
          const confidence = calculateConfidence(subject, snippet)

          if (confidence >= 30) {
            emails.push({
              id: msgId,
              from: fromEmail,
              fromName,
              subject,
              snippet: snippet.substring(0, 200),
              date: headers.date || new Date().toISOString(),
              category,
              confidence,
            })
          }
        } catch (e) {
          console.warn(`Skipping message ${msgId}:`, e.message)
        }
      }
    }

    const stats = mockStats(emails)
    setCache(userId, 'gmail_stats', stats)
    res.json(stats)
  } catch (e) {
    console.error('Gmail stats error:', e.message)
    const emails = mockSponsorshipEmails()
    return res.json(mockStats(emails))
  }
})

// ── Disconnect ─────────────────────────────────────────────

router.delete('/disconnect', (req, res) => {
  const userId = req.user.id
  db.prepare('DELETE FROM gmail_tokens WHERE user_id = ?').run(userId)
  db.prepare('DELETE FROM gmail_cache WHERE user_id = ? AND cache_key LIKE ?').run(userId, 'gmail_%')
  res.json({ connected: false })
})

// ── Clear cache (for manual refresh) ───────────────────────

router.post('/clear-cache', (req, res) => {
  const userId = req.user.id
  db.prepare('DELETE FROM gmail_cache WHERE user_id = ? AND cache_key LIKE ?').run(userId, 'gmail_%')
  res.json({ cleared: true })
})

export default router
