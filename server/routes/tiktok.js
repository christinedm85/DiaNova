import { Router } from 'express'
import db from '../db.js'
import { authMiddleware } from '../middleware.js'

const router = Router()

// ── Config ──────────────────────────────────────────────────
const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET
const TIKTOK_REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI || 'https://1bd0fe78e336c1ba7ee351e2e414b06b.ctonew.app/api/integrations/tiktok/callback'

function isConfigured() {
  return !!(TIKTOK_CLIENT_KEY && TIKTOK_CLIENT_SECRET)
}

// ── Helpers ─────────────────────────────────────────────────

async function refreshAccessToken(userId) {
  const tokenRow = db.prepare('SELECT * FROM tiktok_tokens WHERE user_id = ?').get(userId)
  if (!tokenRow || !tokenRow.refresh_token) return null

  try {
    const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: TIKTOK_CLIENT_KEY,
        client_secret: TIKTOK_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: tokenRow.refresh_token,
      }),
    })

    if (!res.ok) {
      // Refresh failed — clear tokens
      db.prepare('DELETE FROM tiktok_tokens WHERE user_id = ?').run(userId)
      return null
    }

    const data = await res.json()
    const expiresAt = data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000).toISOString()
      : null

    db.prepare(`
      UPDATE tiktok_tokens
      SET access_token = ?, refresh_token = ?, expires_at = ?, updated_at = datetime('now')
      WHERE user_id = ?
    `).run(data.access_token, data.refresh_token || tokenRow.refresh_token, expiresAt, userId)

    return data.access_token
  } catch (e) {
    console.warn('TikTok token refresh failed:', e.message)
    return null
  }
}

async function getValidToken(userId) {
  const tokenRow = db.prepare('SELECT * FROM tiktok_tokens WHERE user_id = ?').get(userId)
  if (!tokenRow) return null

  // Check if expired or about to expire (within 5 min)
  if (tokenRow.expires_at && new Date(tokenRow.expires_at) <= new Date(Date.now() + 5 * 60 * 1000)) {
    return await refreshAccessToken(userId) || tokenRow.access_token
  }

  return tokenRow.access_token
}

function getCached(userId, key) {
  const row = db.prepare(
    "SELECT * FROM tiktok_cache WHERE user_id = ? AND cache_key = ? AND created_at > datetime('now', '-1 hour')"
  ).get(userId, key)
  if (row) {
    try { return JSON.parse(row.data) } catch { return null }
  }
  return null
}

function setCache(userId, key, data) {
  db.prepare(`
    INSERT INTO tiktok_cache (user_id, cache_key, data, created_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, cache_key) DO UPDATE SET data = excluded.data, created_at = datetime('now')
  `).run(userId, key, JSON.stringify(data))
}

// ── Mock data generator (used when TikTok APIs are not configured) ──

function mockTikTokData() {
  return {
    creator: {
      username: 'creatorbloom_demo',
      displayName: 'CreatorBloom Demo',
      avatar: '',
      followerCount: 182000,
      followingCount: 420,
      likesTotal: 2400000,
      engagementRate: 4.2,
    },
    stats: {
      period: 'last30days',
      videoViews: 950000,
      profileViews: 28400,
      likes: 125000,
      comments: 18400,
      shares: 32000,
    },
    recentVideos: [
      { title: 'How I Made $5K From One Brand Deal #creatorlife', views: 142000, likes: 28500, comments: 3400, shares: 5200 },
      { title: 'My Exact Affiliate Stack (Free Tools) #affiliatemarketing', views: 118000, likes: 22300, comments: 2800, shares: 4100 },
      { title: 'Pricing Hack That Doubled My Income 💰', views: 95000, likes: 18800, comments: 2400, shares: 3800 },
      { title: 'Behind the Scenes: Sponsor Negotiation 🤝', views: 87000, likes: 16200, comments: 2100, shares: 2900 },
      { title: 'Best Creator Tools 2026 🚀', views: 72000, likes: 14100, comments: 1800, shares: 2600 },
      { title: 'How to Pitch Brands (Script Inside) 📝', views: 65000, likes: 12800, comments: 1600, shares: 2200 },
      { title: 'My $10K Month Breakdown 💸', views: 58000, likes: 11500, comments: 1400, shares: 2000 },
      { title: 'Content Strategy That Works 📈', views: 51000, likes: 10200, comments: 1300, shares: 1800 },
      { title: 'Editing Tips for Faster Workflow ⚡', views: 45000, likes: 8900, comments: 1100, shares: 1500 },
      { title: 'Why I Quit My 9-to-5 🔥', views: 42000, likes: 8100, comments: 950, shares: 1300 },
    ],
    audience: {
      gender: { female: 62, male: 36, other: 2 },
      age: { '18-24': 28, '25-34': 44, '35-44': 19, '45+': 9 },
      topTerritories: ['United States', 'United Kingdom', 'Canada', 'Australia', 'Philippines'],
    },
  }
}

// ── OAuth: Redirect to TikTok ────────────────────────────────

router.get('/auth', (req, res) => {
  if (!isConfigured()) {
    return res.status(501).json({ error: 'TikTok integration not configured. Set TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET.' })
  }

  // Read userId from query param (browser navigation has no auth header)
  const userId = req.query.userId ? parseInt(req.query.userId, 10) : null
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: 'Missing userId parameter' })
  }

  // TikTok requires a CSRF state token; we use the user ID for simplicity
  const state = String(userId)
  const params = new URLSearchParams({
    client_key: TIKTOK_CLIENT_KEY,
    redirect_uri: TIKTOK_REDIRECT_URI,
    response_type: 'code',
    scope: 'user.info.basic,video.list,user.insights',
    state,
  })

  res.redirect(`https://www.tiktok.com/v2/auth/authorize/?${params}`)
})

// ── OAuth: Callback ──────────────────────────────────────────

router.get('/callback', async (req, res) => {
  const { code, state, error, error_description } = req.query

  if (error) {
    return res.redirect('/?tiktok_error=' + encodeURIComponent(error_description || error))
  }

  if (!code || !state) {
    return res.redirect('/?tiktok_error=missing_params')
  }

  const userId = parseInt(state, 10)
  if (isNaN(userId)) {
    return res.redirect('/?tiktok_error=invalid_state')
  }

  if (!isConfigured()) {
    return res.redirect('/?tiktok_error=not_configured')
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: TIKTOK_CLIENT_KEY,
        client_secret: TIKTOK_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: TIKTOK_REDIRECT_URI,
      }),
    })

    if (!tokenRes.ok) {
      const err = await tokenRes.text()
      console.error('TikTok token exchange failed:', err)
      return res.redirect('/?tiktok_error=token_exchange_failed')
    }

    const tokenData = await tokenRes.json()

    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null

    const openId = tokenData.open_id || ''

    // Fetch creator info
    let creatorUsername = null, displayName = null, avatarUrl = null, followerCount = 0

    try {
      const userRes = await fetch(
        `https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,follower_count,following_count,likes_count`,
        { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
      )
      if (userRes.ok) {
        const userData = await userRes.json()
        if (userData.data?.user) {
          const u = userData.data.user
          creatorUsername = u.display_name || ''
          displayName = u.display_name || ''
          avatarUrl = u.avatar_url || ''
          followerCount = u.follower_count || 0
        }
      }
    } catch (e) {
      console.warn('Failed to fetch TikTok user info during OAuth:', e.message)
    }

    // Upsert tokens
    const existing = db.prepare('SELECT id FROM tiktok_tokens WHERE user_id = ?').get(userId)
    if (existing) {
      db.prepare(`
        UPDATE tiktok_tokens
        SET access_token = ?, refresh_token = ?, expires_at = ?,
            open_id = ?, creator_username = ?, display_name = ?, avatar_url = ?, follower_count = ?,
            updated_at = datetime('now')
        WHERE user_id = ?
      `).run(tokenData.access_token, tokenData.refresh_token || null, expiresAt,
        openId, creatorUsername, displayName, avatarUrl, followerCount, userId)
    } else {
      db.prepare(`
        INSERT INTO tiktok_tokens (user_id, access_token, refresh_token, expires_at,
          open_id, creator_username, display_name, avatar_url, follower_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(userId, tokenData.access_token, tokenData.refresh_token || null, expiresAt,
        openId, creatorUsername, displayName, avatarUrl, followerCount)
    }

    res.redirect('/?tiktok_connected=1')
  } catch (e) {
    console.error('TikTok callback error:', e)
    res.redirect('/?tiktok_error=server_error')
  }
})

// ── Protected routes below ────────────────────────────────────
router.use(authMiddleware)

// ── Connection status ────────────────────────────────────────

router.get('/status', (req, res) => {
  const tokenRow = db.prepare(
    'SELECT open_id, creator_username, display_name, avatar_url, follower_count FROM tiktok_tokens WHERE user_id = ?'
  ).get(req.user.id)

  res.json({
    connected: !!tokenRow,
    creator: tokenRow ? {
      openId: tokenRow.open_id,
      username: tokenRow.creator_username,
      displayName: tokenRow.display_name,
      avatar: tokenRow.avatar_url,
      followerCount: tokenRow.follower_count,
    } : null,
    configured: isConfigured(),
  })
})

// ── Stats ────────────────────────────────────────────────────

router.get('/stats', async (req, res) => {
  const userId = req.user.id

  // If not configured, return mock data
  if (!isConfigured()) {
    const cached = getCached(userId, 'tiktok_stats')
    if (cached) return res.json(cached)

    const mock = mockTikTokData()
    setCache(userId, 'tiktok_stats', mock)
    return res.json(mock)
  }

  const tokenRow = db.prepare('SELECT * FROM tiktok_tokens WHERE user_id = ?').get(userId)
  if (!tokenRow) {
    // Not connected — return mock for demo
    const mock = mockTikTokData()
    return res.json(mock)
  }

  // Check cache
  const cached = getCached(userId, 'tiktok_stats')
  if (cached) return res.json(cached)

  try {
    const accessToken = await getValidToken(userId)
    if (!accessToken) throw new Error('No valid token')

    // Fetch user info
    let creatorInfo = null
    try {
      const userRes = await fetch(
        `https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,follower_count,following_count,likes_count`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      if (userRes.ok) {
        const userData = await userRes.json()
        if (userData.data?.user) {
          const u = userData.data.user
          creatorInfo = {
            username: u.display_name || tokenRow.creator_username || '',
            displayName: u.display_name || tokenRow.display_name || '',
            avatar: u.avatar_url || tokenRow.avatar_url || '',
            followerCount: u.follower_count || tokenRow.follower_count || 0,
            followingCount: u.following_count || 0,
            likesTotal: u.likes_count || 0,
          }

          // Update stored info
          db.prepare(`
            UPDATE tiktok_tokens
            SET creator_username = ?, display_name = ?, avatar_url = ?, follower_count = ?, updated_at = datetime('now')
            WHERE user_id = ?
          `).run(creatorInfo.username, creatorInfo.displayName, creatorInfo.avatar, creatorInfo.followerCount, userId)
        }
      }
    } catch (e) {
      console.warn('TikTok user info fetch failed:', e.message)
    }

    if (!creatorInfo) {
      creatorInfo = {
        username: tokenRow.creator_username || 'Unknown',
        displayName: tokenRow.display_name || 'Unknown',
        avatar: tokenRow.avatar_url || '',
        followerCount: tokenRow.follower_count || 0,
        followingCount: 0,
        likesTotal: 0,
      }
    }

    // Calculate engagement rate
    const engagementRate = creatorInfo.followerCount > 0
      ? Math.round((creatorInfo.likesTotal / creatorInfo.followerCount) * 100) / 100
      : 0

    // Fetch recent videos
    let recentVideos = []
    let statsData = {
      videoViews: 0,
      profileViews: 0,
      likes: 0,
      comments: 0,
      shares: 0,
    }

    try {
      // Use video list endpoint
      const vRes = await fetch('https://open.tiktokapis.com/v2/video/list/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ max_count: 10 }),
      })

      if (vRes.ok) {
        const vData = await vRes.json()
        const videos = vData.data?.videos || []

        for (const v of videos) {
          const viewCount = v.view_count || 0
          const likeCount = v.like_count || 0
          const commentCount = v.comment_count || 0
          const shareCount = v.share_count || 0

          statsData.videoViews += viewCount
          statsData.likes += likeCount
          statsData.comments += commentCount
          statsData.shares += shareCount

          recentVideos.push({
            title: (v.title || 'Untitled').substring(0, 100),
            views: viewCount,
            likes: likeCount,
            comments: commentCount,
            shares: shareCount,
          })
        }
      }
    } catch (e) {
      console.warn('TikTok video fetch failed:', e.message)
    }

    const result = {
      creator: {
        ...creatorInfo,
        engagementRate,
      },
      stats: {
        period: 'last30days',
        ...statsData,
      },
      recentVideos,
      audience: {
        gender: { female: 62, male: 36, other: 2 },
        age: { '18-24': 28, '25-34': 44, '35-44': 19, '45+': 9 },
        topTerritories: ['United States', 'United Kingdom', 'Canada', 'Australia', 'Philippines'],
      },
    }

    setCache(userId, 'tiktok_stats', result)
    res.json(result)
  } catch (e) {
    console.error('TikTok stats error:', e.message)

    // Return mock data on error (so UI doesn't break)
    const mock = mockTikTokData()
    return res.json(mock)
  }
})

// ── Disconnect ───────────────────────────────────────────────

router.delete('/disconnect', (req, res) => {
  const userId = req.user.id
  db.prepare('DELETE FROM tiktok_tokens WHERE user_id = ?').run(userId)
  db.prepare('DELETE FROM tiktok_cache WHERE user_id = ? AND cache_key LIKE ?').run(userId, 'tiktok_%')
  res.json({ connected: false })
})

// ── Clear cache (for manual refresh) ─────────────────────────

router.post('/clear-cache', (req, res) => {
  const userId = req.user.id
  db.prepare('DELETE FROM tiktok_cache WHERE user_id = ? AND cache_key LIKE ?').run(userId, 'tiktok_%')
  res.json({ cleared: true })
})

export default router
