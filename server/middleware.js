import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const db = new Database(path.join(__dirname, 'creatorbloom.db'))

let JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  console.warn('')
  console.warn('⚠️  WARNING: JWT_SECRET environment variable is not set.')
  console.warn('   Using a randomly generated secret for this session.')
  console.warn('   All tokens will be invalidated on server restart.')
  console.warn('   Set JWT_SECRET in your environment for production use.')
  console.warn('')
  JWT_SECRET = crypto.randomBytes(64).toString('hex')
}

export function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, plan: user.plan }, JWT_SECRET, { expiresIn: '7d' })
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const token = header.split(' ')[1]
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// Optional auth — attaches user if token present, but doesn't block
export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization
  if (header && header.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(header.split(' ')[1], JWT_SECRET)
    } catch { /* token invalid, continue anyway */ }
  }
  next()
}

// Resolve team scope — sets req.scopeUserId to the effective user ID for data queries
export function teamScope(req, _res, next) {
  const member = db.prepare(`
    SELECT t.owner_id FROM teams t
    JOIN team_members tm ON tm.team_id = t.id
    WHERE tm.user_id = ?
  `).get(req.user.id)

  req.scopeUserId = member ? member.owner_id : req.user.id
  next()
}

// Error logger — logs errors to DB
export function logError(err, req) {
  try {
    db.prepare('INSERT INTO error_logs (message, stack, route, method, user_id, status_code) VALUES (?,?,?,?,?,?)')
      .run(
        err.message || String(err),
        err.stack?.substring(0, 2000) || null,
        req?.originalUrl || req?.url || null,
        req?.method || null,
        req?.user?.id || null,
        err.status || err.statusCode || 500
      )
  } catch (e) {
    console.error('Failed to log error:', e.message)
  }
}
