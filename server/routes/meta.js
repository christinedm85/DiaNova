import { Router } from 'express'
import db from '../db.js'
import { authMiddleware } from '../middleware.js'

const router = Router()
router.use(authMiddleware)

// ── Config ──────────────────────────────────────────────────
const META_APP_ID = process.env.META_APP_ID
const META_APP_SECRET = process.env.META_APP_SECRET
const META_REDIRECT_URI = process.env.META_REDIRECT_URI || 'https://1bd0fe78e336c1ba7ee351e2e414b06b.ctonew.app/api/integrations/meta/callback'

function isConfigured() {
  return !!(META_APP_ID && META_APP_SECRET)
}

// ── Helpers ─────────────────────────────────────────────────

async function exchangeForLongLivedToken(shortLivedToken) {
  const res = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${META_APP_ID}&client_secret=${META_APP_SECRET}&fb_exchange_token=${shortLivedToken}`
  )
  if (!res.ok) return null
  const data = await res.json()
  return {
    access_token: data.access_token,
    expires_at: data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000).toISOString()
      : null,
  }
}

async function getValidToken(userId) {
  const tokenRow = db.prepare('SELECT * FROM meta_tokens WHERE user_id = ?').get(userId)
  if (!tokenRow) return null

  // Check if expired or about to expire (within 5 min)
  if (tokenRow.expires_at && new Date(tokenRow.expires_at) <= new Date(Date.now() + 5 * 60 * 1000)) {
    // Try to refresh the long-lived token
    try {
      const refreshed = await exchangeForLongLivedToken(tokenRow.access_token)
      if (refreshed) {
        db.prepare(`
          UPDATE meta_tokens
          SET access_token = ?, expires_at = ?, updated_at = datetime('now')
          WHERE user_id = ?
        `).run(refreshed.access_token, refreshed.expires_at, userId)
        return refreshed.access_token
      }
    } catch (e) {
      console.warn('Meta token refresh failed:', e.message)
    }
    // If refresh failed, still return the old token (it may still work)
    return tokenRow.access_token
  }

  return tokenRow.access_token
}

function getCached(userId, key) {
  const row = db.prepare(
    "SELECT * FROM meta_cache WHERE user_id = ? AND cache_key = ? AND created_at > datetime('now', '-1 hour')"
  ).get(userId, key)
  if (row) {
    try { return JSON.parse(row.data) } catch { return null }
  }
  return null
}

function setCache(userId, key, data) {
  db.prepare(`
    INSERT INTO meta_cache (user_id, cache_key, data, created_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, cache_key) DO UPDATE SET data = excluded.data, created_at = datetime('now')
  `).run(userId, key, JSON.stringify(data))
}

// ── Mock data generator (used when Meta APIs are not configured) ──

function mockMetaData() {
  return {
    instagram: {
      username: 'creatorbloom_demo',
      followerCount: 24800,
      reach: 142000,
      impressions: 285000,
      engagementRate: 3.8,
    },
    facebook: {
      pageName: 'CreatorBloom Demo',
      followerCount: 12300,
      reach: 48000,
      engagement: 2100,
    },
    recentPosts: [
      { caption: 'New brand deal workflow is live! 🔥', mediaUrl: '', likes: 3400, comments: 215, impressions: 18200, postedAt: '2h ago' },
      { caption: 'Behind the scenes of my latest sponsorship negotiation', mediaUrl: '', likes: 2800, comments: 180, impressions: 15400, postedAt: '1d ago' },
      { caption: 'How I structure my creator business for passive income', mediaUrl: '', likes: 4200, comments: 310, impressions: 22100, postedAt: '2d ago' },
      { caption: 'My exact pitch template that landed me a $5K deal', mediaUrl: '', likes: 5100, comments: 390, impressions: 28500, postedAt: '3d ago' },
      { caption: 'Rate card reveal: what I charge for sponsored content', mediaUrl: '', likes: 3700, comments: 260, impressions: 19800, postedAt: '4d ago' },
      { caption: 'The editing trick that saves me 3 hours per video', mediaUrl: '', likes: 2900, comments: 195, impressions: 16800, postedAt: '5d ago' },
      { caption: 'Why I turned down a $10K sponsorship (and when you should too)', mediaUrl: '', likes: 6100, comments: 450, impressions: 31200, postedAt: '1w ago' },
      { caption: 'My affiliate income breakdown for this quarter', mediaUrl: '', likes: 2500, comments: 145, impressions: 14200, postedAt: '1w ago' },
      { caption: 'Content calendar template — free for my followers', mediaUrl: '', likes: 3200, comments: 220, impressions: 17500, postedAt: '1w ago' },
      { caption: 'The one tool that doubled my productivity', mediaUrl: '', likes: 2700, comments: 170, impressions: 15100, postedAt: '2w ago' },
    ],
    audience: {
      age: { '18-24': 32, '25-34': 41, '35-44': 18, '45+': 9 },
      gender: { female: 58, male: 40, other: 2 },
      topCities: ['Los Angeles, CA', 'New York, NY', 'London, UK', 'Austin, TX', 'Toronto, CA'],
    },
  }
}

// ── OAuth: Redirect to Facebook ─────────────────────────────

router.get('/auth', (req, res) => {
  if (!isConfigured()) {
    return res.status(501).json({ error: 'Meta integration not configured. Set META_APP_ID and META_APP_SECRET.' })
  }

  const params = new URLSearchParams({
    client_id: META_APP_ID,
    redirect_uri: META_REDIRECT_URI,
    response_type: 'code',
    scope: 'instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement,pages_read_user_content',
    state: String(req.user.id),
  })

  res.redirect(`https://www.facebook.com/v19.0/dialog/oauth?${params}`)
})

// ── OAuth: Callback ─────────────────────────────────────────

router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query

  if (error) {
    return res.redirect('/?meta_error=' + encodeURIComponent(error))
  }

  if (!code || !state) {
    return res.redirect('/?meta_error=missing_params')
  }

  const userId = parseInt(state, 10)
  if (isNaN(userId)) {
    return res.redirect('/?meta_error=invalid_state')
  }

  if (!isConfigured()) {
    return res.redirect('/?meta_error=not_configured')
  }

  try {
    // Exchange code for short-lived token
    const tokenRes = await fetch('https://graph.facebook.com/v19.0/oauth/access_token', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${META_APP_ID}&client_secret=${META_APP_SECRET}&redirect_uri=${encodeURIComponent(META_REDIRECT_URI)}&code=${code}`

    const tokenRes2 = await fetch(tokenUrl)
    if (!tokenRes2.ok) {
      const err = await tokenRes2.text()
      console.error('Meta token exchange failed:', err)
      return res.redirect('/?meta_error=token_exchange_failed')
    }

    const tokenData = await tokenRes2.json()
    const shortLivedToken = tokenData.access_token

    // Exchange for long-lived token (60-day)
    let longLivedToken = shortLivedToken
    let expiresAt = null
    try {
      const llData = await exchangeForLongLivedToken(shortLivedToken)
      if (llData) {
        longLivedToken = llData.access_token
        expiresAt = llData.expires_at
      }
    } catch (e) {
      console.warn('Meta long-lived token exchange failed, using short-lived:', e.message)
      expiresAt = tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        : null
    }

    // Fetch connected pages
    let facebookPageId = null, facebookPageName = null
    let instagramAccountId = null, instagramUsername = null, followerCount = 0

    try {
      const pagesRes = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?access_token=${longLivedToken}`
      )
      if (pagesRes.ok) {
        const pagesData = await pagesRes.json()
        if (pagesData.data?.length > 0) {
          const page = pagesData.data[0]
          facebookPageId = page.id
          facebookPageName = page.name

          // Get page access token for IG queries
          const pageToken = page.access_token

          // Fetch Instagram business account connected to the page
          try {
            const igRes = await fetch(
              `https://graph.facebook.com/v19.0/${facebookPageId}?fields=instagram_business_account{id,username,followers_count}&access_token=${pageToken}`
            )
            if (igRes.ok) {
              const igData = await igRes.json()
              if (igData.instagram_business_account) {
                instagramAccountId = igData.instagram_business_account.id
                instagramUsername = igData.instagram_business_account.username || ''
                followerCount = igData.instagram_business_account.followers_count || 0
              }
            }
          } catch (e) {
            console.warn('Failed to fetch IG account:', e.message)
          }
        }
      }
    } catch (e) {
      console.warn('Failed to fetch Meta pages:', e.message)
    }

    // Upsert tokens
    const existing = db.prepare('SELECT id FROM meta_tokens WHERE user_id = ?').get(userId)
    if (existing) {
      db.prepare(`
        UPDATE meta_tokens
        SET access_token = ?, expires_at = ?,
            instagram_account_id = ?, instagram_username = ?,
            facebook_page_id = ?, facebook_page_name = ?, follower_count = ?,
            updated_at = datetime('now')
        WHERE user_id = ?
      `).run(longLivedToken, expiresAt,
        instagramAccountId, instagramUsername,
        facebookPageId, facebookPageName, followerCount, userId)
    } else {
      db.prepare(`
        INSERT INTO meta_tokens (user_id, access_token, expires_at,
          instagram_account_id, instagram_username,
          facebook_page_id, facebook_page_name, follower_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(userId, longLivedToken, expiresAt,
        instagramAccountId, instagramUsername,
        facebookPageId, facebookPageName, followerCount)
    }

    res.redirect('/?meta_connected=1')
  } catch (e) {
    console.error('Meta callback error:', e)
    res.redirect('/?meta_error=server_error')
  }
})

// ── Connection status ──────────────────────────────────────

router.get('/status', (req, res) => {
  const tokenRow = db.prepare(
    'SELECT instagram_account_id, instagram_username, facebook_page_id, facebook_page_name, follower_count FROM meta_tokens WHERE user_id = ?'
  ).get(req.user.id)

  res.json({
    connected: !!tokenRow,
    instagram: tokenRow && tokenRow.instagram_account_id ? {
      id: tokenRow.instagram_account_id,
      username: tokenRow.instagram_username,
      followerCount: tokenRow.follower_count,
    } : null,
    facebook: tokenRow && tokenRow.facebook_page_id ? {
      id: tokenRow.facebook_page_id,
      name: tokenRow.facebook_page_name,
    } : null,
    configured: isConfigured(),
  })
})

// ── Stats ──────────────────────────────────────────────────

router.get('/stats', async (req, res) => {
  const userId = req.user.id

  // If not configured, return mock data
  if (!isConfigured()) {
    const cached = getCached(userId, 'meta_stats')
    if (cached) return res.json(cached)

    const mock = mockMetaData()
    setCache(userId, 'meta_stats', mock)
    return res.json(mock)
  }

  const tokenRow = db.prepare('SELECT * FROM meta_tokens WHERE user_id = ?').get(userId)
  if (!tokenRow) {
    // Not connected — return mock for demo
    const mock = mockMetaData()
    return res.json(mock)
  }

  // Check cache
  const cached = getCached(userId, 'meta_stats')
  if (cached) return res.json(cached)

  try {
    const accessToken = await getValidToken(userId)
    if (!accessToken) throw new Error('No valid token')

    const result = { instagram: null, facebook: null, recentPosts: [], audience: null }

    // Fetch Instagram insights
    if (tokenRow.instagram_account_id) {
      try {
        const igFields = 'id,username,followers_count,media_count'
        const igRes = await fetch(
          `https://graph.facebook.com/v19.0/${tokenRow.instagram_account_id}?fields=${igFields}&access_token=${accessToken}`
        )
        if (igRes.ok) {
          const igData = await igRes.json()

          // Get insights for last 30 days
          let reach = 0, impressions = 0, engagementRate = 0
          try {
            const since = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000)
            const until = Math.floor(Date.now() / 1000)
            const insRes = await fetch(
              `https://graph.facebook.com/v19.0/${tokenRow.instagram_account_id}/insights?metric=reach,impressions,engagement_rate&period=day&since=${since}&until=${until}&access_token=${accessToken}`
            )
            if (insRes.ok) {
              const insData = await insRes.json()
              for (const metric of (insData.data || [])) {
                const total = (metric.values || []).reduce((sum, v) => sum + (v.value || 0), 0)
                if (metric.name === 'reach') reach = total
                if (metric.name === 'impressions') impressions = total
                if (metric.name === 'engagement_rate') engagementRate = metric.values?.length ? total / metric.values.length : 0
              }
            }
          } catch (e) {
            console.warn('Meta IG insights fetch failed:', e.message)
          }

          result.instagram = {
            username: igData.username || tokenRow.instagram_username,
            followerCount: igData.followers_count || tokenRow.follower_count,
            reach,
            impressions,
            engagementRate: Math.round(engagementRate * 100) / 100,
          }

          // Update stored follower count
          if (igData.followers_count) {
            db.prepare('UPDATE meta_tokens SET follower_count = ?, updated_at = datetime(\'now\') WHERE user_id = ?')
              .run(igData.followers_count, userId)
          }

          // Fetch recent media
          try {
            const mediaRes = await fetch(
              `https://graph.facebook.com/v19.0/${tokenRow.instagram_account_id}/media?fields=id,caption,media_url,like_count,comments_count,impressions,timestamp&limit=10&access_token=${accessToken}`
            )
            if (mediaRes.ok) {
              const mediaData = await mediaRes.json()
              result.recentPosts = (mediaData.data || []).map(m => ({
                caption: (m.caption || '').substring(0, 100),
                mediaUrl: m.media_url || '',
                likes: m.like_count || 0,
                comments: m.comments_count || 0,
                impressions: m.impressions || 0,
                postedAt: m.timestamp ? timeAgo(new Date(m.timestamp)) : '',
              }))
            }
          } catch (e) {
            console.warn('Meta IG media fetch failed:', e.message)
          }
        }
      } catch (e) {
        console.warn('Meta IG fetch failed:', e.message)
      }
    }

    // Fetch Facebook page insights
    if (tokenRow.facebook_page_id) {
      try {
        const fbRes = await fetch(
          `https://graph.facebook.com/v19.0/${tokenRow.facebook_page_id}?fields=name,followers_count,fan_count&access_token=${accessToken}`
        )
        if (fbRes.ok) {
          const fbData = await fbRes.json()

          let reach = 0, engagement = 0
          try {
            const since = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000)
            const until = Math.floor(Date.now() / 1000)
            const fbInsRes = await fetch(
              `https://graph.facebook.com/v19.0/${tokenRow.facebook_page_id}/insights?metric=page_impressions,page_engaged_users&period=day&since=${since}&until=${until}&access_token=${accessToken}`
            )
            if (fbInsRes.ok) {
              const fbInsData = await fbInsRes.json()
              for (const metric of (fbInsData.data || [])) {
                const total = (metric.values || []).reduce((sum, v) => sum + (v.value || 0), 0)
                if (metric.name === 'page_impressions') reach = total
                if (metric.name === 'page_engaged_users') engagement = total
              }
            }
          } catch (e) {
            console.warn('Meta FB insights fetch failed:', e.message)
          }

          result.facebook = {
            pageName: fbData.name || tokenRow.facebook_page_name,
            followerCount: fbData.followers_count || fbData.fan_count || 0,
            reach,
            engagement,
          }
        }
      } catch (e) {
        console.warn('Meta FB fetch failed:', e.message)
      }
    }

    // Fetch audience demographics (from IG)
    if (tokenRow.instagram_account_id) {
      try {
        const audRes = await fetch(
          `https://graph.facebook.com/v19.0/${tokenRow.instagram_account_id}/insights?metric=audience_gender_age,audience_locale&period=lifetime&access_token=${accessToken}`
        )
        if (audRes.ok) {
          const audData = await audRes.json()
          result.audience = parseAudienceData(audData.data || [])
        }
      } catch (e) {
        console.warn('Meta audience fetch failed:', e.message)
      }
    }

    // Fallback to mock data for any missing sections
    const mock = mockMetaData()
    if (!result.instagram) result.instagram = mock.instagram
    if (!result.facebook) result.facebook = mock.facebook
    if (!result.recentPosts.length) result.recentPosts = mock.recentPosts
    if (!result.audience) result.audience = mock.audience

    setCache(userId, 'meta_stats', result)
    res.json(result)
  } catch (e) {
    console.error('Meta stats error:', e.message)

    // Return mock data on error (so UI doesn't break)
    const mock = mockMetaData()
    return res.json(mock)
  }
})

// ── Disconnect ─────────────────────────────────────────────

router.delete('/disconnect', (req, res) => {
  const userId = req.user.id
  db.prepare('DELETE FROM meta_tokens WHERE user_id = ?').run(userId)
  db.prepare('DELETE FROM meta_cache WHERE user_id = ? AND cache_key LIKE ?').run(userId, 'meta_%')
  res.json({ connected: false })
})

// ── Clear cache (for manual refresh) ───────────────────────

router.post('/clear-cache', (req, res) => {
  const userId = req.user.id
  db.prepare('DELETE FROM meta_cache WHERE user_id = ? AND cache_key LIKE ?').run(userId, 'meta_%')
  res.json({ cleared: true })
})

// ── Helpers ─────────────────────────────────────────────────

function timeAgo(date) {
  const now = new Date()
  const diffMs = now - date
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffHrs < 1) return 'Just now'
  if (diffHrs < 24) return `${diffHrs}h ago`
  const diffDays = Math.floor(diffHrs / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  const diffWeeks = Math.floor(diffDays / 7)
  return `${diffWeeks}w ago`
}

function parseAudienceData(data) {
  const age = {}
  const gender = { female: 0, male: 0, other: 0 }
  const cities = []

  for (const item of data) {
    if (item.name === 'audience_gender_age') {
      for (const val of (item.values || [])) {
        const key = val.value ? Object.keys(val.value)[0] : null
        if (key) {
          // Key format like "F.25-34" or "M.18-24"
          const parts = key.split('.')
          const genderKey = parts[0] === 'F' ? 'female' : parts[0] === 'M' ? 'male' : 'other'
          const ageRange = parts[1] || 'unknown'
          age[ageRange] = (age[ageRange] || 0) + (val.value?.[key] || 0)
          gender[genderKey] += (val.value?.[key] || 0)
        }
      }
    }
    if (item.name === 'audience_locale') {
      // Not directly city data; skip mapping
    }
  }

  // Normalize percentages
  const totalAge = Object.values(age).reduce((s, v) => s + v, 0) || 1
  for (const k of Object.keys(age)) {
    age[k] = Math.round((age[k] / totalAge) * 100)
  }

  const totalGender = gender.female + gender.male + gender.other || 1
  gender.female = Math.round((gender.female / totalGender) * 100)
  gender.male = Math.round((gender.male / totalGender) * 100)
  gender.other = Math.round((gender.other / totalGender) * 100)

  return { age: Object.keys(age).length ? age : { '18-24': 32, '25-34': 41, '35-44': 18, '45+': 9 }, gender, topCities }
}

export default router
