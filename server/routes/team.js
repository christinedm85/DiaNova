import { Router } from 'express'
import crypto from 'crypto'
import db from '../db.js'
import { authMiddleware } from '../middleware.js'

const router = Router()
router.use(authMiddleware)

// Get current user's team
router.get('/', (req, res) => {
  const member = db.prepare(`
    SELECT t.*, tm.role FROM teams t
    JOIN team_members tm ON tm.team_id = t.id
    WHERE tm.user_id = ?
  `).get(req.user.id)

  if (!member) return res.json({ team: null })

  const members = db.prepare(`
    SELECT u.id, u.name, u.email, tm.role FROM team_members tm
    JOIN users u ON u.id = tm.user_id
    WHERE tm.team_id = ?
  `).all(member.id)

  res.json({ team: { ...member, members } })
})

// Invite a member
router.post('/invite', (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email is required' })

  // Get or create team for this user (only Studio users can have teams)
  if (req.user.plan !== 'studio') {
    return res.status(403).json({ error: 'Team access requires the Studio plan. Upgrade in Billing.' })
  }

  let team = db.prepare('SELECT * FROM teams WHERE owner_id = ?').get(req.user.id)
  if (!team) {
    const info = db.prepare('INSERT INTO teams (name, owner_id) VALUES (?, ?)').run(`${req.user.name || 'My'} Team`, req.user.id)
    team = db.prepare('SELECT * FROM teams WHERE id = ?').get(info.lastInsertRowid)
    // Add owner as member
    db.prepare('INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)').run(team.id, req.user.id, 'owner')
  }

  // Check if already a member
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existingUser) {
    const existingMember = db.prepare('SELECT id FROM team_members WHERE team_id = ? AND user_id = ?').get(team.id, existingUser.id)
    if (existingMember) return res.status(409).json({ error: 'This person is already on your team' })
  }

  // Generate invite token
  const token = crypto.randomBytes(16).toString('hex')
  db.prepare('INSERT INTO team_invites (team_id, email, token) VALUES (?, ?, ?)').run(team.id, email, token)

  // Log invite
  console.log(`\n📨 Team invite for ${email}: join with token ${token}\n`)

  res.json({ invited: true, email })
})

// Accept invite (another user clicks the invite link)
router.post('/accept', (req, res) => {
  const { token } = req.body
  if (!token) return res.status(400).json({ error: 'Token required' })

  const invite = db.prepare('SELECT * FROM team_invites WHERE token = ?').get(token)
  if (!invite) return res.status(400).json({ error: 'Invalid or expired invite' })

  // Add user to team (using their current auth)
  const existing = db.prepare('SELECT id FROM team_members WHERE team_id = ? AND user_id = ?').get(invite.team_id, req.user.id)
  if (!existing) {
    db.prepare('INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)').run(invite.team_id, req.user.id, invite.role)
  }

  // Delete invite
  db.prepare('DELETE FROM team_invites WHERE id = ?').run(invite.id)

  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(invite.team_id)
  res.json({ joined: true, team: team.name })
})

// Remove a member
router.delete('/members/:userId', (req, res) => {
  const team = db.prepare('SELECT * FROM teams WHERE owner_id = ?').get(req.user.id)
  if (!team) return res.status(404).json({ error: 'No team found' })

  const member = db.prepare('SELECT * FROM team_members WHERE team_id = ? AND user_id = ?').get(team.id, req.params.userId)
  if (!member) return res.status(404).json({ error: 'Member not found' })
  if (member.role === 'owner') return res.status(400).json({ error: 'Cannot remove the team owner' })

  db.prepare('DELETE FROM team_members WHERE team_id = ? AND user_id = ?').run(team.id, req.params.userId)
  res.json({ removed: true })
})

export default router
