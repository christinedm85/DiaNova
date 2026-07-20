import { Resend } from 'resend'
import nodemailer from 'nodemailer'
import db from './db.js'

// --- Transport detection ---

const smtpConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS)

const resend = (!smtpConfigured && process.env.RESEND_API_KEY)
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const smtpTransport = smtpConfigured
  ? nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // STARTTLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null

const EMAIL_FROM = process.env.EMAIL_FROM || (smtpConfigured ? process.env.SMTP_USER : 'CreatorPilot <noreply@dianova.tech>')

// --- Determine active transport name for logging ---
function transportName() {
  if (smtpConfigured) return 'SMTP'
  if (resend) return 'Resend'
  return 'fallback'
}

/**
 * Send an email — three-tier priority:
 *   Tier 1: SMTP (Gmail) if SMTP_USER + SMTP_PASS are set
 *   Tier 2: Resend SDK if RESEND_API_KEY is set and SMTP is not
 *   Tier 3: console.log fallback if neither is configured
 */
export async function sendEmail(to_email, to_name, subject, body, type, userId) {
  // Always log to DB for audit trail (before sending)
  db.prepare('INSERT INTO sent_emails (to_email, to_name, subject, body, type, user_id) VALUES (?,?,?,?,?,?)')
    .run(to_email, to_name, subject, body, type, userId)

  // Tier 1: SMTP
  if (smtpTransport) {
    try {
      const info = await smtpTransport.sendMail({
        from: EMAIL_FROM,
        to: to_email,
        subject,
        text: body,
      })
      console.log(`[email] Sent via SMTP to ${to_email} (msgId: ${info.messageId})`)
      return true
    } catch (err) {
      console.error(`[email] SMTP send failed for ${to_email}:`, err.message)
      return false
    }
  }

  // Tier 2: Resend
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
      console.log(`[email] Sent via Resend to ${to_email}`)
      return true
    } catch (err) {
      console.error(`[email] Resend send failed for ${to_email}:`, err.message)
      return false
    }
  }

  // Tier 3: Fallback — print the link so developers can click through
  console.log(`\n📨 ${subject} → ${to_email}`)
  console.log(`   ${body}\n`)
  return true
}

/**
 * Check whether real email sending is configured (either SMTP or Resend).
 */
export function isEmailConfigured() {
  return smtpConfigured || !!resend
}
