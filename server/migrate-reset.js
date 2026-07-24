import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const db = new Database(path.join(__dirname, 'creatorpilot.db'))

// Add reset_token + reset_expires to users
const usersCols = db.prepare(`PRAGMA table_info(users)`).all().map(c => c.name)
if (!usersCols.includes('reset_token')) {
  db.exec(`ALTER TABLE users ADD COLUMN reset_token TEXT DEFAULT NULL`)
  console.log('users: added reset_token')
}
if (!usersCols.includes('reset_expires')) {
  db.exec(`ALTER TABLE users ADD COLUMN reset_expires TEXT DEFAULT NULL`)
  console.log('users: added reset_expires')
}

// Also ensure users table has created_at if missing
if (!usersCols.includes('created_at')) {
  db.exec(`ALTER TABLE users ADD COLUMN created_at TEXT DEFAULT (datetime('now'))`)
  console.log('users: added created_at')
}

console.log('Password reset migration complete')
