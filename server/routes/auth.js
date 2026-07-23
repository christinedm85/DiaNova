import { Router } from 'express'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import rateLimit from 'express-rate-limit'
import db from '../db.js'
import { generateToken, authMiddleware } from '../middleware.js'
import { sendEmail, isEmailConfigured } from '../email.js'

const router = Router()
const origin = () => process.env.APP_URL || `http://localhost:${process.env.PORT || 3001}`
const logLink = (label, url) => {
  if (!isEmailConfigured()) {
    console.log(`\n📨 ${label}:`)
    console.log(`   ${url}\n`)
  }
}

// ── Rate limiters ─────────────────────────────────────

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again in 15 minutes.' },
})

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again in 15 minutes.' },
})

const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many email requests. Please try again later.' },
})

// ── Helpers ──────────────────────────────────────────────

function makeToken() {
  const raw = crypto.randomBytes(32).toString('hex')
  const hashed = crypto.createHash('sha256').update(raw).digest('hex')
  return { raw, hashed }
}

function seedUserData(userId) {
  db.prepare('INSERT INTO sponsorships (brand, amount, status, notes, user_id) VALUES (?, ?, ?, ?, ?)')
    .run('Your First Brand', 1000, 'prospecting', 'Start here!', userId)
}

// ── Register ─────────────────────────────────────────────

router.post('/register', authLimiter, (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }

  const existing = db.prepare('SELECT id, email_verified FROM users WHERE email = ?').get(email)
  if (existing) {
    // Re-register flow: if unverified, allow re-sending verification
    if (!existing.email_verified) {
      const { raw, hashed } = makeToken()
      db.prepare('UPDATE users SET verification_token = ?, name = ?, password = ? WHERE id = ?')
        .run(hashed, name, bcrypt.hashSync(password, 10), existing.id)

      const verifyUrl = `${origin()}/verify-email?token=${raw}`
      void sendEmail(email, name, 'Verify your CreatorBloom account',
        `Hi ${name},\n\nWelcome to CreatorBloom! Click the link below to verify your email and activate your account:\n\n${verifyUrl}\n\n— The CreatorBloom Team`,
        'email-verification', existing.id)
      logLink('Verification re-sent', verifyUrl)

      return res.status(201).json({ needsVerification: true, email })
    }
    return res.status(409).json({ error: 'Email already registered' })
  }

  const hash = bcrypt.hashSync(password, 10)
  const info = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email, hash)

  // Track signup conversion
  db.prepare('INSERT INTO conversions (type, user_id, metadata) VALUES (?, ?, ?)').run('signup', info.lastInsertRowid, JSON.stringify({ name }))

  const { raw, hashed } = makeToken()
  db.prepare('UPDATE users SET verification_token = ? WHERE id = ?').run(hashed, info.lastInsertRowid)

  const verifyUrl = `${origin()}/verify-email?token=${raw}`
  void sendEmail(email, name, 'Verify your CreatorBloom account',
    `Hi ${name},\n\nWelcome to CreatorBloom! Click the link below to verify your email and activate your account:\n\n${verifyUrl}\n\n— The CreatorBloom Team`,
    'email-verification', info.lastInsertRowid)
  logLink('Verification', verifyUrl)

  res.status(201).json({ needsVerification: true, email })
})

// ── Verify email ─────────────────────────────────────────

router.get('/verify-email', (req, res) => {
  const { token } = req.query
  if (!token) return res.status(400).json({ error: 'Token required' })

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
  const user = db.prepare('SELECT id, name, email, plan, email_verified FROM users WHERE verification_token = ?').get(hashedToken)

  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired verification link.' })
  }

  if (!user.email_verified) {
    db.prepare('UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = ?').run(user.id)
    seedUserData(user.id)
  }

  const { email_verified: _, verification_token: __, ...safeUser } = user
  safeUser.email_verified = 1
  const jwt = generateToken(safeUser)
  res.json({ user: safeUser, token: jwt })
})

// ── Resend verification ─────────────────────────────────

router.post('/resend-verification', emailLimiter, (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email is required' })

  // Always return success to prevent enumeration
  const user = db.prepare('SELECT id, name, email, email_verified FROM users WHERE email = ?').get(email)
  if (!user || user.email_verified) {
    return res.json({ message: 'If that account needs verification, a new link has been sent.' })
  }

  const { raw, hashed } = makeToken()
  db.prepare('UPDATE users SET verification_token = ? WHERE id = ?').run(hashed, user.id)

  const verifyUrl = `${origin()}/verify-email?token=${raw}`
  void sendEmail(email, user.name, 'Verify your CreatorBloom account',
    `Hi ${user.name},\n\nClick the link below to verify your email and activate your account:\n\n${verifyUrl}\n\n— The CreatorBloom Team`,
    'email-verification', user.id)
  logLink('Verification re-sent', verifyUrl)

  res.json({ message: 'If that account needs verification, a new link has been sent.' })
})

// ── Login ────────────────────────────────────────────────

router.post('/login', authLimiter, (req, res) => {
  const { email, password } = req.body

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  if (!user.email_verified) {
    return res.status(403).json({ error: 'Please verify your email before signing in.', needsVerification: true, email: user.email })
  }

  const { password: _, verification_token: __, reset_token: ___, reset_expires: ____, ...safeUser } = user
  const token = generateToken(safeUser)

  res.json({ user: safeUser, token })
})

// ── Me ───────────────────────────────────────────────────

router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, name, email, plan, onboarding_complete, notify_deal_moved, notify_new_lead, is_admin FROM users WHERE id = ?').get(req.user.id)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json({ user })
})

// ── Onboarding ───────────────────────────────────────────

router.post('/onboarding-complete', authMiddleware, (req, res) => {
  db.prepare('UPDATE users SET onboarding_complete = 1 WHERE id = ?').run(req.user.id)
  res.json({ onboarding_complete: true })
})

// ── Profile (update name / password) ─────────────────────

router.put('/profile', authMiddleware, (req, res) => {
  const { name, currentPassword, newPassword, notify_deal_moved, notify_new_lead } = req.body
  const userId = req.user.id

  if (name && name.trim().length > 0) {
    db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name.trim(), userId)
  }

  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({ error: 'Current password is required to set a new password' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' })
    }
    const user = db.prepare('SELECT password FROM users WHERE id = ?').get(userId)
    if (!bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(400).json({ error: 'Current password is incorrect' })
    }
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(bcrypt.hashSync(newPassword, 10), userId)
  }

  if (notify_deal_moved !== undefined) {
    db.prepare('UPDATE users SET notify_deal_moved = ? WHERE id = ?').run(notify_deal_moved ? 1 : 0, userId)
  }
  if (notify_new_lead !== undefined) {
    db.prepare('UPDATE users SET notify_new_lead = ? WHERE id = ?').run(notify_new_lead ? 1 : 0, userId)
  }

  const updated = db.prepare('SELECT id, name, email, plan, notify_deal_moved, notify_new_lead FROM users WHERE id = ?').get(userId)
  res.json({ user: updated })
})

// ── Forgot password ──────────────────────────────────────

router.post('/forgot-password', emailLimiter, (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email is required' })

  const user = db.prepare('SELECT id, name, email FROM users WHERE email = ?').get(email)
  if (!user) {
    return res.json({ message: 'If that email is registered, a reset link has been sent.' })
  }

  const { raw, hashed } = makeToken()
  db.prepare("UPDATE users SET reset_token = ?, reset_expires = datetime('now', '+1 hour') WHERE id = ?")
    .run(hashed, user.id)

  const resetUrl = `${origin()}/reset-password?token=${raw}`
  void sendEmail(email, user.name, 'Reset your CreatorBloom password',
    `Hi ${user.name},\n\nWe received a request to reset your password. Click the link below to choose a new one:\n\n${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, you can safely ignore this email.\n\n— The CreatorBloom Team`,
    'password-reset', user.id)
  logLink('Password reset', resetUrl)

  res.json({ message: 'If that email is registered, a reset link has been sent.' })
})

router.get('/verify-reset-token', (req, res) => {
  const { token } = req.query
  if (!token) return res.status(400).json({ valid: false })

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
  const user = db.prepare(
    "SELECT id FROM users WHERE reset_token = ? AND reset_expires > datetime('now')"
  ).get(hashedToken)

  res.json({ valid: !!user })
})

router.post('/reset-password', strictLimiter, (req, res) => {
  const { token, password } = req.body
  if (!token || !password) return res.status(400).json({ error: 'Token and new password are required' })
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
  const user = db.prepare(
    "SELECT id FROM users WHERE reset_token = ? AND reset_expires > datetime('now')"
  ).get(hashedToken)

  if (!user) return res.status(400).json({ error: 'Invalid or expired reset link.' })

  db.prepare('UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?')
    .run(bcrypt.hashSync(password, 10), user.id)

  res.json({ message: 'Password has been reset. You can now log in.' })
})

export default router
