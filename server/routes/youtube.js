import { Router } from 'express'
import db from '../db.js'
import { authMiddleware } from '../middleware.js'

const router = Router()
router.use(authMiddleware)

// ── Config ──────────────────────────────────────────────────
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'https://1bd0fe78e336c1ba7ee351e2e414b06b.ctonew.app/api/integrations/youtube/callback'

function isConfigured() {
  return !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET)
}

// ── Helpers ─────────────────────────────────────────────────

async function refreshAccessToken(userId) {
  const tokenRow = db.prepare('SELECT * FROM youtube_tokens WHERE user_id = ?').get(userId)
  if (!tokenRow || !tokenRow.refresh_token) return null

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: tokenRow.refresh_token,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) {
    // Refresh failed — clear tokens
    db.prepare('DELETE FROM youtube_tokens WHERE user_id = ?').run(userId)
    return null
  }

  const data = await res.json()
  const expiresAt = data.expires_in
    ? new Date(Date.now() + data.expires_in * 1000).toISOString()
    : null

  db.prepare(`
    UPDATE youtube_tokens
    SET access_token = ?, expires_at = ?, updated_at = datetime('now')
    WHERE user_id = ?
  `).run(data.access_token, expiresAt, userId)

  return data.access_token
}

async function getValidToken(userId) {
  const tokenRow = db.prepare('SELECT * FROM youtube_tokens WHERE user_id = ?').get(userId)
  if (!tokenRow) return null

  // Check if expired or about to expire (within 5 min)
  if (tokenRow.expires_at && new Date(tokenRow.expires_at) <= new Date(Date.now() + 5 * 60 * 1000)) {
    return await refreshAccessToken(userId) || tokenRow.access_token
  }

  return tokenRow.access_token
}

function getCached(userId, key) {
  const row = db.prepare(
    "SELECT * FROM youtube_cache WHERE user_id = ? AND cache_key = ? AND created_at > datetime('now', '-1 hour')"
  ).get(userId, key)
  if (row) {
    try { return JSON.parse(row.data) } catch { return null }
  }
  return null
}

function setCache(userId, key, data) {
  db.prepare(`
    INSERT INTO youtube_cache (user_id, cache_key, data, created_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, cache_key) DO UPDATE SET data = excluded.data, created_at = datetime('now')
  `).run(userId, key, JSON.stringify(data))
}

// ── Mock data generator (used when Google APIs are not configured) ──

function mockChannelData() {
  return {
    channel: {
      id: 'UC-mock-channel-123',
      title: 'CreatorBloom Demo',
      thumbnail: 'https://via.placeholder.com/88/6366f1/ffffff?text=CB',
      subscriberCount: 45200,
      viewCount: 1280000,
      videoCount: 87,
    },
    stats: {
      period: 'last30days',
      views: 284500,
      watchTimeMinutes: 14200,
      estimatedRevenue: 1842.50,
      subscriberChange: 1250,
    },
    topVideos: [
      { title: 'How I Made $5K From One Brand Deal', thumbnail: '', views: 84200, likes: 3200, comments: 480 },
      { title: 'My Exact Affiliate Stack (Free Tools)', thumbnail: '', views: 67300, likes: 2800, comments: 390 },
      { title: 'Pricing Tier: When to Charge More', thumbnail: '', views: 52100, likes: 2100, comments: 310 },
      { title: 'Behind the Scenes: Sponsor Negotiation', thumbnail: '', views: 48100, likes: 1900, comments: 260 },
      { title: 'Best Creator Tools 2026', thumbnail: '', views: 39500, likes: 1600, comments: 220 },
      { title: 'How to Pitch Brands (Script Inside)', thumbnail: '', views: 36200, likes: 1400, comments: 195 },
      { title: 'My $10K Month Breakdown', thumbnail: '', views: 31800, likes: 1250, comments: 170 },
      { title: 'Content Strategy That Works', thumbnail: '', views: 28400, likes: 1100, comments: 150 },
      { title: 'Editing Tips for Faster Workflow', thumbnail: '', views: 25100, likes: 980, comments: 135 },
      { title: 'Why I Quit My 9-to-5', thumbnail: '', views: 22900, likes: 870, comments: 120 },
    ],
  }
}

// ── OAuth: Redirect to Google ──────────────────────────────

router.get('/auth', (req, res) => {
  if (!isConfigured()) {
    return res.status(501).json({ error: 'YouTube integration not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.' })
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly',
    access_type: 'offline',
    prompt: 'consent',
    state: String(req.user.id),
  })

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
})

// ── OAuth: Callback ─────────────────────────────────────────

router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query

  if (error) {
    return res.redirect('/?youtube_error=' + encodeURIComponent(error))
  }

  if (!code || !state) {
    return res.redirect('/?youtube_error=missing_params')
  }

  const userId = parseInt(state, 10)
  if (isNaN(userId)) {
    return res.redirect('/?youtube_error=invalid_state')
  }

  if (!isConfigured()) {
    return res.redirect('/?youtube_error=not_configured')
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      const err = await tokenRes.text()
      console.error('Google token exchange failed:', err)
      return res.redirect('/?youtube_error=token_exchange_failed')
    }

    const tokenData = await tokenRes.json()

    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null

    // Fetch channel info
    let channelId = null, channelTitle = null, thumbnailUrl = null, subscriberCount = 0

    try {
      const chRes = await fetch(
        'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
        { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
      )
      if (chRes.ok) {
        const chData = await chRes.json()
        if (chData.items?.length > 0) {
          const c = chData.items[0]
          channelId = c.id
          channelTitle = c.snippet?.title || ''
          thumbnailUrl = c.snippet?.thumbnails?.default?.url || c.snippet?.thumbnails?.medium?.url || ''
          subscriberCount = parseInt(c.statistics?.subscriberCount) || 0
        }
      }
    } catch (e) {
      console.warn('Failed to fetch channel info during OAuth:', e.message)
    }

    // Upsert tokens
    const existing = db.prepare('SELECT id FROM youtube_tokens WHERE user_id = ?').get(userId)
    if (existing) {
      db.prepare(`
        UPDATE youtube_tokens
        SET access_token = ?, refresh_token = ?, expires_at = ?,
            channel_id = ?, channel_title = ?, thumbnail_url = ?, subscriber_count = ?,
            updated_at = datetime('now')
        WHERE user_id = ?
      `).run(tokenData.access_token, tokenData.refresh_token || null, expiresAt,
        channelId, channelTitle, thumbnailUrl, subscriberCount, userId)
    } else {
      db.prepare(`
        INSERT INTO youtube_tokens (user_id, access_token, refresh_token, expires_at,
          channel_id, channel_title, thumbnail_url, subscriber_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(userId, tokenData.access_token, tokenData.refresh_token || null, expiresAt,
        channelId, channelTitle, thumbnailUrl, subscriberCount)
    }

    res.redirect('/?youtube_connected=1')
  } catch (e) {
    console.error('YouTube callback error:', e)
    res.redirect('/?youtube_error=server_error')
  }
})

// ── Connection status ──────────────────────────────────────

router.get('/status', (req, res) => {
  const tokenRow = db.prepare(
    'SELECT channel_id, channel_title, thumbnail_url, subscriber_count FROM youtube_tokens WHERE user_id = ?'
  ).get(req.user.id)

  res.json({
    connected: !!tokenRow,
    channel: tokenRow ? {
      id: tokenRow.channel_id,
      title: tokenRow.channel_title,
      thumbnail: tokenRow.thumbnail_url,
      subscriberCount: tokenRow.subscriber_count,
    } : null,
    configured: isConfigured(),
  })
})

// ── Stats ──────────────────────────────────────────────────

router.get('/stats', async (req, res) => {
  const userId = req.user.id

  // If not configured or no tokens, return mock data
  if (!isConfigured()) {
    const cached = getCached(userId, 'youtube_stats')
    if (cached) return res.json(cached)

    const mock = mockChannelData()
    setCache(userId, 'youtube_stats', mock)
    return res.json(mock)
  }

  const tokenRow = db.prepare('SELECT * FROM youtube_tokens WHERE user_id = ?').get(userId)
  if (!tokenRow) {
    // Not connected — return mock for demo
    const mock = mockChannelData()
    return res.json(mock)
  }

  // Check cache
  const cached = getCached(userId, 'youtube_stats')
  if (cached) return res.json(cached)

  try {
    const accessToken = await getValidToken(userId)
    if (!accessToken) throw new Error('No valid token')

    // Fetch channel info
    const chRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${tokenRow.channel_id}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    const chData = await chRes.json()
    const channel = chData.items?.[0]
    const channelInfo = channel ? {
      id: channel.id,
      title: channel.snippet?.title || '',
      thumbnail: channel.snippet?.thumbnails?.default?.url || channel.snippet?.thumbnails?.medium?.url || '',
      subscriberCount: parseInt(channel.statistics?.subscriberCount) || 0,
      viewCount: parseInt(channel.statistics?.viewCount) || 0,
      videoCount: parseInt(channel.statistics?.videoCount) || 0,
    } : null

    // Update stored channel info
    if (channel) {
      db.prepare(`
        UPDATE youtube_tokens
        SET channel_title = ?, thumbnail_url = ?, subscriber_count = ?, updated_at = datetime('now')
        WHERE user_id = ?
      `).run(channelInfo.title, channelInfo.thumbnail, channelInfo.subscriberCount, userId)
    }

    // Fetch analytics
    let analyticsData = { views: 0, watchTimeMinutes: 0, estimatedRevenue: 0, subscriberChange: 0 }
    try {
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const anRes = await fetch(
        `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==${tokenRow.channel_id}&startDate=${startDate}&endDate=${endDate}&metrics=views,estimatedMinutesWatched,estimatedRevenue,subscribersGained,subscribersLost`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      if (anRes.ok) {
        const anData = await anRes.json()
        if (anData.rows?.length > 0) {
          const [views, watchMin, revenue, gained, lost] = anData.rows[0]
          analyticsData = {
            views: views || 0,
            watchTimeMinutes: Math.round((watchMin || 0)),
            estimatedRevenue: Math.round((revenue || 0) * 100) / 100,
            subscriberChange: (gained || 0) - (lost || 0),
          }
        }
      }
    } catch (e) {
      console.warn('YouTube Analytics API failed, using partial data:', e.message)
    }

    // Fetch top videos via search
    let topVideos = []
    try {
      const vRes = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${tokenRow.channel_id}&maxResults=10&order=viewCount&type=video`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      if (vRes.ok) {
        const vData = await vRes.json()
        const videoIds = vData.items?.map(v => v.id.videoId).filter(Boolean) || []

        if (videoIds.length > 0) {
          const statsRes = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds.join(',')}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          )
          if (statsRes.ok) {
            const statsData = await statsRes.json()
            topVideos = (statsData.items || []).map(v => ({
              title: v.snippet?.title || '',
              thumbnail: v.snippet?.thumbnails?.default?.url || '',
              views: parseInt(v.statistics?.viewCount) || 0,
              likes: parseInt(v.statistics?.likeCount) || 0,
              comments: parseInt(v.statistics?.commentCount) || 0,
            }))
          }
        }
      }
    } catch (e) {
      console.warn('YouTube video fetch failed:', e.message)
    }

    const result = {
      channel: channelInfo || {
        id: tokenRow.channel_id,
        title: tokenRow.channel_title || 'Unknown',
        thumbnail: tokenRow.thumbnail_url || '',
        subscriberCount: tokenRow.subscriber_count || 0,
        viewCount: 0,
        videoCount: 0,
      },
      stats: {
        period: 'last30days',
        ...analyticsData,
      },
      topVideos,
    }

    setCache(userId, 'youtube_stats', result)
    res.json(result)
  } catch (e) {
    console.error('YouTube stats error:', e.message)

    // Return mock data on error (so UI doesn't break)
    const mock = mockChannelData()
    return res.json(mock)
  }
})

// ── Disconnect ─────────────────────────────────────────────

router.delete('/disconnect', (req, res) => {
  const userId = req.user.id
  db.prepare('DELETE FROM youtube_tokens WHERE user_id = ?').run(userId)
  db.prepare('DELETE FROM youtube_cache WHERE user_id = ? AND cache_key LIKE ?').run(userId, 'youtube_%')
  res.json({ connected: false })
})

// ── Clear cache (for manual refresh) ───────────────────────

router.post('/clear-cache', (req, res) => {
  const userId = req.user.id
  db.prepare('DELETE FROM youtube_cache WHERE user_id = ? AND cache_key LIKE ?').run(userId, 'youtube_%')
  res.json({ cleared: true })
})

export default router
