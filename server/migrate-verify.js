import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const db = new Database(path.join(__dirname, 'creatorpilot.db'))

const usersCols = db.prepare(`PRAGMA table_info(users)`).all().map(c => c.name)
if (!usersCols.includes('email_verified')) {
  db.exec(`ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0`)
  console.log('users: added email_verified')
}
if (!usersCols.includes('verification_token')) {
  db.exec(`ALTER TABLE users ADD COLUMN verification_token TEXT DEFAULT NULL`)
  console.log('users: added verification_token')
}

// Mark existing users as verified (they predate this feature)
db.prepare('UPDATE users SET email_verified = 1 WHERE email_verified = 0').run()
console.log('Existing users marked as verified')

console.log('Email verification migration complete')
