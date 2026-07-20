import { Resend } from 'resend'
import db from './db.js'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const EMAIL_FROM = process.env.EMAIL_FROM || 'CreatorPilot <noreply@creatorpilot.dev>'

/**
 * Send an email — uses Resend when RESEND_API_KEY is set,
 * otherwise falls back to DB insert + console.log for local dev.
 */
export async function sendEmail(to_email, to_name, subject, body, type, userId) {
  // Always log to DB for audit trail
  db.prepare('INSERT INTO sent_emails (to_email, to_name, subject, body, type, user_id) VALUES (?,?,?,?,?,?)')
    .run(to_email, to_name, subject, body, type, userId)

  if (resend) {
    try {
      const { error } = await resend.emails.send({
        from: EMAIL_FROM,
        to: to_email,
        subject,
        text: body,
      })
      if (error) {
        console.error(`[email] Resend error for ${to_email}:`, error.message)
        return false
      }
      console.log(`[email] Sent "${subject}" to ${to_email} via Resend`)
      return true
    } catch (err) {
      console.error(`[email] Resend send failed for ${to_email}:`, err.message)
      return false
    }
  } else {
    // Dev fallback — print the link so developers can click through
    console.log(`\n📨 ${subject} → ${to_email}`)
    console.log(`   ${body}\n`)
    return true
  }
}

/**
 * Check whether real email sending is configured.
 */
export function isEmailConfigured() {
  return !!resend
}
