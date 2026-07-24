import { Router } from 'express'
import crypto from 'crypto'
import db from '../db.js'
import { authMiddleware } from '../middleware.js'

const router = Router()
router.use(authMiddleware)

// ── Encryption helpers ───────────────────────────────────────

function deriveKey(secret) {
  return crypto.createHash('sha256').update(secret).digest()
}

function encrypt(text, secret) {
  if (!text) return null
  const key = deriveKey(secret)
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

function decrypt(encryptedText, secret) {
  if (!encryptedText) return null
  const key = deriveKey(secret)
  const parts = encryptedText.split(':')
  if (parts.length !== 2) return null
  const iv = Buffer.from(parts[0], 'hex')
  const encrypted = Buffer.from(parts[1], 'hex')
  try {
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
  } catch {
    return null
  }
}

function maskKey(key) {
  if (!key || key.length < 8) return '••••'
  return key.substring(0, 4) + '•••' + key.substring(key.length - 4)
}

// ── Cache helpers ────────────────────────────────────────────

function getCached(userId, key) {
  const row = db.prepare(
    "SELECT * FROM monetization_cache WHERE user_id = ? AND cache_key = ? AND created_at > datetime('now', '-1 hour')"
  ).get(userId, key)
  if (row) {
    try { return JSON.parse(row.data) } catch { return null }
  }
  return null
}

function setCache(userId, key, data) {
  db.prepare(`
    INSERT INTO monetization_cache (user_id, cache_key, data, created_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, cache_key) DO UPDATE SET data = excluded.data, created_at = datetime('now')
  `).run(userId, key, JSON.stringify(data))
}

// ── Mock data generators ─────────────────────────────────────

function mockStripeData() {
  const now = new Date()
  const revenueData = []
  let total = 0
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dailyRevenue = Math.round((200 + Math.random() * 800) * 100) / 100
    total += dailyRevenue
    revenueData.push({
      date: d.toISOString().split('T')[0],
      revenue: dailyRevenue,
    })
  }

  const mrr = 5200 + Math.round(Math.random() * 800)

  return {
    totalRevenue: Math.round(total * 100) / 100,
    revenueThisMonth: Math.round((total * 0.35) * 100) / 100,
    activeSubscriptions: 87 + Math.floor(Math.random() * 20),
    mrr,
    revenueChart: revenueData,
    recentTransactions: [
      { id: 'ch_3NkR12', amount: 49.00, customer: 'Sarah Chen', date: new Date(now - 2 * 3600000).toISOString(), status: 'succeeded' },
      { id: 'ch_3NkR11', amount: 29.00, customer: 'Marcus Webb', date: new Date(now - 8 * 3600000).toISOString(), status: 'succeeded' },
      { id: 'ch_3NkR10', amount: 79.00, customer: 'Priya Patel', date: new Date(now - 16 * 3600000).toISOString(), status: 'succeeded' },
      { id: 'ch_3NkR09', amount: 149.00, customer: 'James Kim', date: new Date(now - 24 * 3600000).toISOString(), status: 'succeeded' },
      { id: 'ch_3NkR08', amount: 29.00, customer: 'Olivia Ruiz', date: new Date(now - 36 * 3600000).toISOString(), status: 'refunded' },
      { id: 'ch_3NkR07', amount: 49.00, customer: 'Alex Rivera', date: new Date(now - 48 * 3600000).toISOString(), status: 'succeeded' },
      { id: 'ch_3NkR06', amount: 79.00, customer: 'Taylor Wong', date: new Date(now - 58 * 3600000).toISOString(), status: 'succeeded' },
      { id: 'ch_3NkR05', amount: 29.00, customer: 'Jordan Lee', date: new Date(now - 65 * 3600000).toISOString(), status: 'succeeded' },
      { id: 'ch_3NkR04', amount: 199.00, customer: 'Morgan Smith', date: new Date(now - 72 * 3600000).toISOString(), status: 'succeeded' },
      { id: 'ch_3NkR03', amount: 49.00, customer: 'Casey Brown', date: new Date(now - 80 * 3600000).toISOString(), status: 'succeeded' },
    ].slice(0, 10),
  }
}

function mockShopifyData() {
  const now = new Date()
  const revenueData = []
  let total = 0
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dailyRevenue = Math.round((100 + Math.random() * 600) * 100) / 100
    total += dailyRevenue
    revenueData.push({
      date: d.toISOString().split('T')[0],
      revenue: dailyRevenue,
    })
  }

  const orderCount = 45 + Math.floor(Math.random() * 20)

  return {
    totalSales: Math.round(total * 100) / 100,
    orderCount,
    averageOrderValue: Math.round((total / orderCount) * 100) / 100,
    revenueChart: revenueData,
    topProducts: [
      { title: 'Creator Template Pack', revenue: 2840, orders: 98 },
      { title: 'Video Editing Presets', revenue: 1890, orders: 76 },
      { title: 'Brand Deal Playbook', revenue: 1560, orders: 32 },
      { title: 'Content Calendar Notion', revenue: 980, orders: 45 },
      { title: 'Lightroom Presets Bundle', revenue: 720, orders: 38 },
    ],
    recentOrders: [
      { id: '#1042', customer: 'Emily Davis', total: 49.00, date: new Date(now - 3 * 3600000).toISOString(), status: 'fulfilled' },
      { id: '#1041', customer: 'Ryan Cooper', total: 29.00, date: new Date(now - 9 * 3600000).toISOString(), status: 'fulfilled' },
      { id: '#1040', customer: 'Nina Patel', total: 79.00, date: new Date(now - 15 * 3600000).toISOString(), status: 'paid' },
      { id: '#1039', customer: 'David Kim', total: 149.00, date: new Date(now - 22 * 3600000).toISOString(), status: 'fulfilled' },
      { id: '#1038', customer: 'Sophie Martin', total: 29.00, date: new Date(now - 30 * 3600000).toISOString(), status: 'fulfilled' },
      { id: '#1037', customer: 'Lucas Brown', total: 49.00, date: new Date(now - 40 * 3600000).toISOString(), status: 'refunded' },
      { id: '#1036', customer: 'Aria Wilson', total: 79.00, date: new Date(now - 48 * 3600000).toISOString(), status: 'fulfilled' },
      { id: '#1035', customer: 'Noah Taylor', total: 29.00, date: new Date(now - 55 * 3600000).toISOString(), status: 'fulfilled' },
      { id: '#1034', customer: 'Mia Johnson', total: 199.00, date: new Date(now - 62 * 3600000).toISOString(), status: 'fulfilled' },
      { id: '#1033', customer: 'Ethan Lee', total: 49.00, date: new Date(now - 70 * 3600000).toISOString(), status: 'fulfilled' },
    ].slice(0, 10),
  }
}

// ── Stripe: Connect ─────────────────────────────────────────

router.post('/stripe/connect', (req, res) => {
  const userId = req.user.id
  const { secretKey } = req.body

  // If empty body or empty secretKey, disconnect
  if (!secretKey || !secretKey.trim()) {
    const existing = db.prepare('SELECT id FROM monetization_tokens WHERE user_id = ?').get(userId)
    if (existing) {
      db.prepare(`
        UPDATE monetization_tokens SET
          stripe_key_encrypted = NULL,
          stripe_connected = 0,
          updated_at = datetime('now')
        WHERE user_id = ?
      `).run(userId)
    }
    db.prepare("DELETE FROM monetization_cache WHERE user_id = ? AND cache_key LIKE 'stripe_%'").run(userId)
    return res.json({ connected: false, maskedKey: null })
  }

  const encrypted = encrypt(secretKey.trim(), process.env.JWT_SECRET)

  const existing = db.prepare('SELECT id FROM monetization_tokens WHERE user_id = ?').get(userId)
  if (existing) {
    db.prepare(`
      UPDATE monetization_tokens SET
        stripe_key_encrypted = ?,
        stripe_connected = 1,
        updated_at = datetime('now')
      WHERE user_id = ?
    `).run(encrypted, userId)
  } else {
    db.prepare(`
      INSERT INTO monetization_tokens (user_id, stripe_key_encrypted, stripe_connected)
      VALUES (?, ?, 1)
    `).run(userId, encrypted)
  }

  res.json({ connected: true, maskedKey: maskKey(secretKey.trim()) })
})

// ── Stripe: Stats ───────────────────────────────────────────

router.get('/stripe/stats', async (req, res) => {
  const userId = req.user.id

  // Check cache first
  const cached = getCached(userId, 'stripe_stats')
  if (cached) return res.json(cached)

  const tokenRow = db.prepare('SELECT * FROM monetization_tokens WHERE user_id = ? AND stripe_connected = 1').get(userId)

  // If not connected, return mock data
  if (!tokenRow || !tokenRow.stripe_key_encrypted) {
    const mock = mockStripeData()
    setCache(userId, 'stripe_stats', mock)
    return res.json(mock)
  }

  // Try real Stripe API
  try {
    const stripeKey = decrypt(tokenRow.stripe_key_encrypted, process.env.JWT_SECRET)
    if (!stripeKey) throw new Error('Failed to decrypt Stripe key')

    const now = Math.floor(Date.now() / 1000)
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60
    const firstOfMonth = Math.floor(new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime() / 1000)

    // Fetch balance transactions for revenue data
    const stripeRes = await fetch('https://api.stripe.com/v1/balance_transactions', {
      headers: {
        Authorization: `Bearer ${stripeKey}`,
      },
      method: 'GET',
    })

    if (!stripeRes.ok) {
      const err = await stripeRes.text()
      console.error('Stripe API error:', err)
      throw new Error('Stripe API error')
    }

    const stripeData = await stripeRes.json()
    const transactions = (stripeData.data || []).filter(t => t.created >= thirtyDaysAgo)

    // Calculate totals
    const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount / 100), 0)
    const revenueThisMonth = transactions
      .filter(t => t.created >= firstOfMonth)
      .reduce((sum, t) => sum + (t.amount / 100), 0)

    // Revenue chart: daily for last 30 days
    const revenueChart = []
    const dailyMap = {}
    for (const t of transactions) {
      const day = new Date(t.created * 1000).toISOString().split('T')[0]
      dailyMap[day] = (dailyMap[day] || 0) + t.amount / 100
    }
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      revenueChart.push({ date: key, revenue: Math.round((dailyMap[key] || 0) * 100) / 100 })
    }

    // Try to fetch subscriptions for MRR and active count
    let activeSubscriptions = 0
    let mrr = 0
    try {
      const subRes = await fetch('https://api.stripe.com/v1/subscriptions?status=active&limit=100', {
        headers: { Authorization: `Bearer ${stripeKey}` },
      })
      if (subRes.ok) {
        const subData = await subRes.json()
        activeSubscriptions = subData.data?.length || 0
        mrr = (subData.data || []).reduce((sum, s) => {
          const items = s.items?.data || []
          return sum + items.reduce((is, item) => is + (item.price?.unit_amount || 0) / 100 * (item.quantity || 1), 0)
        }, 0)
      }
    } catch (e) {
      console.warn('Stripe subscriptions fetch failed:', e.message)
    }

    // Recent transactions
    const recentTransactions = transactions.slice(0, 10).map(t => ({
      id: t.id,
      amount: t.amount / 100,
      customer: t.source || 'Unknown',
      date: new Date(t.created * 1000).toISOString(),
      status: t.type === 'charge' ? 'succeeded' : t.type,
    }))

    const result = {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      revenueThisMonth: Math.round(revenueThisMonth * 100) / 100,
      activeSubscriptions,
      mrr: Math.round(mrr * 100) / 100,
      revenueChart,
      recentTransactions,
    }

    setCache(userId, 'stripe_stats', result)
    return res.json(result)
  } catch (e) {
    console.error('Stripe stats error:', e.message)
    // Fall back to mock data on error
    const mock = mockStripeData()
    setCache(userId, 'stripe_stats', mock)
    return res.json(mock)
  }
})

// ── Stripe: Disconnect ──────────────────────────────────────

router.delete('/stripe/disconnect', (req, res) => {
  const userId = req.user.id
  const existing = db.prepare('SELECT id FROM monetization_tokens WHERE user_id = ?').get(userId)
  if (existing) {
    db.prepare(`
      UPDATE monetization_tokens SET
        stripe_key_encrypted = NULL,
        stripe_connected = 0,
        updated_at = datetime('now')
      WHERE user_id = ?
    `).run(userId)
  }
  db.prepare("DELETE FROM monetization_cache WHERE user_id = ? AND cache_key LIKE 'stripe_%'").run(userId)
  res.json({ connected: false })
})

// ── Shopify: Connect ────────────────────────────────────────

router.post('/shopify/connect', (req, res) => {
  const userId = req.user.id
  const { storeUrl, accessToken } = req.body

  // If empty body or no credentials, disconnect
  if (!storeUrl || !accessToken || !storeUrl.trim() || !accessToken.trim()) {
    const existing = db.prepare('SELECT id FROM monetization_tokens WHERE user_id = ?').get(userId)
    if (existing) {
      db.prepare(`
        UPDATE monetization_tokens SET
          shopify_url = NULL,
          shopify_token_encrypted = NULL,
          shopify_connected = 0,
          updated_at = datetime('now')
        WHERE user_id = ?
      `).run(userId)
    }
    db.prepare("DELETE FROM monetization_cache WHERE user_id = ? AND cache_key LIKE 'shopify_%'").run(userId)
    return res.json({ connected: false, maskedToken: null, storeUrl: null })
  }

  const encryptedToken = encrypt(accessToken.trim(), process.env.JWT_SECRET)

  const existing = db.prepare('SELECT id FROM monetization_tokens WHERE user_id = ?').get(userId)
  if (existing) {
    db.prepare(`
      UPDATE monetization_tokens SET
        shopify_url = ?,
        shopify_token_encrypted = ?,
        shopify_connected = 1,
        updated_at = datetime('now')
      WHERE user_id = ?
    `).run(storeUrl.trim(), encryptedToken, userId)
  } else {
    db.prepare(`
      INSERT INTO monetization_tokens (user_id, shopify_url, shopify_token_encrypted, shopify_connected)
      VALUES (?, ?, ?, 1)
    `).run(userId, storeUrl.trim(), encryptedToken)
  }

  res.json({ connected: true, maskedToken: maskKey(accessToken.trim()), storeUrl: storeUrl.trim() })
})

// ── Shopify: Stats ──────────────────────────────────────────

router.get('/shopify/stats', async (req, res) => {
  const userId = req.user.id

  // Check cache first
  const cached = getCached(userId, 'shopify_stats')
  if (cached) return res.json(cached)

  const tokenRow = db.prepare('SELECT * FROM monetization_tokens WHERE user_id = ? AND shopify_connected = 1').get(userId)

  // If not connected, return mock data
  if (!tokenRow || !tokenRow.shopify_token_encrypted || !tokenRow.shopify_url) {
    const mock = mockShopifyData()
    setCache(userId, 'shopify_stats', mock)
    return res.json(mock)
  }

  // Try real Shopify API
  try {
    const accessToken = decrypt(tokenRow.shopify_token_encrypted, process.env.JWT_SECRET)
    const storeUrl = tokenRow.shopify_url
    if (!accessToken) throw new Error('Failed to decrypt Shopify token')

    // Normalize store URL
    const baseUrl = storeUrl.replace(/\/+$/, '').replace(/^https?:\/\//, '')

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // Build GraphQL or REST queries. Use REST for simplicity.
    // Fetch orders from last 30 days
    const ordersUrl = `https://${baseUrl}/admin/api/2024-01/orders.json?status=any&created_at_min=${thirtyDaysAgo}&limit=50`
    const ordersRes = await fetch(ordersUrl, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    })

    if (!ordersRes.ok) {
      const errText = await ordersRes.text()
      console.error('Shopify API error:', errText)
      throw new Error('Shopify API error')
    }

    const ordersData = await ordersRes.json()
    const orders = ordersData.orders || []

    // Calculate totals
    const totalSales = orders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0)
    const orderCount = orders.length
    const averageOrderValue = orderCount > 0 ? totalSales / orderCount : 0

    // Revenue by day
    const dailyMap = {}
    for (const o of orders) {
      const day = o.created_at.split('T')[0]
      dailyMap[day] = (dailyMap[day] || 0) + parseFloat(o.total_price || 0)
    }
    const revenueChart = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      revenueChart.push({ date: key, revenue: Math.round((dailyMap[key] || 0) * 100) / 100 })
    }

    // Top products by revenue (from line items)
    const productMap = {}
    for (const o of orders) {
      for (const item of (o.line_items || [])) {
        const title = item.title || 'Unknown Product'
        const revenue = parseFloat(item.price || 0) * (item.quantity || 1)
        if (!productMap[title]) productMap[title] = { revenue: 0, orders: 0 }
        productMap[title].revenue += revenue
        productMap[title].orders += item.quantity || 1
      }
    }
    const topProducts = Object.entries(productMap)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5)
      .map(([title, data]) => ({
        title,
        revenue: Math.round(data.revenue * 100) / 100,
        orders: data.orders,
      }))

    // Recent orders
    const recentOrders = orders.slice(0, 10).map(o => ({
      id: `#${o.order_number || o.id}`,
      customer: `${o.customer?.first_name || ''} ${o.customer?.last_name || 'Unknown'}`.trim(),
      total: parseFloat(o.total_price || 0),
      date: o.created_at,
      status: o.fulfillment_status || o.financial_status || 'paid',
    }))

    const result = {
      totalSales: Math.round(totalSales * 100) / 100,
      orderCount,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      revenueChart,
      topProducts,
      recentOrders,
    }

    setCache(userId, 'shopify_stats', result)
    return res.json(result)
  } catch (e) {
    console.error('Shopify stats error:', e.message)
    // Fall back to mock data on error
    const mock = mockShopifyData()
    setCache(userId, 'shopify_stats', mock)
    return res.json(mock)
  }
})

// ── Shopify: Disconnect ─────────────────────────────────────

router.delete('/shopify/disconnect', (req, res) => {
  const userId = req.user.id
  const existing = db.prepare('SELECT id FROM monetization_tokens WHERE user_id = ?').get(userId)
  if (existing) {
    db.prepare(`
      UPDATE monetization_tokens SET
        shopify_url = NULL,
        shopify_token_encrypted = NULL,
        shopify_connected = 0,
        updated_at = datetime('now')
      WHERE user_id = ?
    `).run(userId)
  }
  db.prepare("DELETE FROM monetization_cache WHERE user_id = ? AND cache_key LIKE 'shopify_%'").run(userId)
  res.json({ connected: false })
})

// ── Combined status endpoint ─────────────────────────────────

router.get('/status', (req, res) => {
  const userId = req.user.id
  const row = db.prepare(
    'SELECT stripe_connected, shopify_connected, shopify_url FROM monetization_tokens WHERE user_id = ?'
  ).get(userId)

  res.json({
    stripe: { connected: !!(row?.stripe_connected) },
    shopify: {
      connected: !!(row?.shopify_connected),
      storeUrl: row?.shopify_url || null,
    },
  })
})

export default router
