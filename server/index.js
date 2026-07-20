import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import db from './db.js'
import sponsorshipsRouter from './routes/sponsorships.js'
import affiliatesRouter from './routes/affiliates.js'
import leadsRouter from './routes/leads.js'
import pricingRouter from './routes/pricing.js'
import productsRouter from './routes/products.js'
import brandRouter from './routes/brand.js'
import dashboardRouter from './routes/dashboard.js'
import emailRouter from './routes/email.js'
import authRouter from './routes/auth.js'
import billingRouter from './routes/billing.js'
import exportRouter from './routes/export.js'
import teamRouter from './routes/team.js'
import analyticsRouter from './routes/analytics.js'
import { teamScope, logError, authMiddleware } from './middleware.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// API routes — data routes get team scope resolution
app.use('/api/sponsorships', sponsorshipsRouter)
app.use('/api/affiliates', affiliatesRouter)
app.use('/api/leads', leadsRouter)
app.use('/api/pricing', pricingRouter)
app.use('/api/products', productsRouter)
app.use('/api/brand', brandRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/email', emailRouter)
app.use('/api/export', exportRouter)
app.use('/api/team', teamRouter)
app.use('/api/analytics', analyticsRouter)
app.use('/api/auth', authRouter)
app.use('/api/billing', billingRouter)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error logs viewer (auth required)
app.get('/api/errors', authMiddleware, (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 200)
  const rows = db.prepare('SELECT * FROM error_logs ORDER BY created_at DESC LIMIT ?').all(limit)
  res.json(rows)
})

// Global error handler
app.use((err, req, res, _next) => {
  logError(err, req)
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message)
  res.status(err.status || err.statusCode || 500).json({ error: 'Internal server error' })
})

// 404 for unmatched API routes
app.use((req, res, next) => {
  if (!req.path.startsWith('/api/')) return next()
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`)
  err.status = 404
  logError(err, req)
  res.status(404).json({ error: 'Not found' })
})

// Serve production build — SPA fallback (non-API routes only)
const distPath = path.join(__dirname, '..', 'dist')
app.use(express.static(distPath))
app.use((req, res) => {
  if (req.path.startsWith('/api/')) return
  res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`CreatorPilot running on http://localhost:${PORT}`)
})
