import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const db = new Database(path.join(__dirname, 'creatorbloom.db'))

const usersCols = db.prepare(`PRAGMA table_info(users)`).all().map(c => c.name)
if (!usersCols.includes('onboarding_complete')) {
  db.exec(`ALTER TABLE users ADD COLUMN onboarding_complete INTEGER DEFAULT 0`)
  console.log('users: added onboarding_complete')
}
// Mark existing users as onboarded
db.prepare('UPDATE users SET onboarding_complete = 1 WHERE onboarding_complete = 0 AND email_verified = 1').run()
console.log('Existing verified users marked as onboarded')

console.log('Onboarding migration complete')
