import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const db = new Database(path.join(__dirname, 'creatorbloom.db'))

const usersCols = db.prepare(`PRAGMA table_info(users)`).all().map(c => c.name)
if (!usersCols.includes('notify_deal_moved')) {
  db.exec(`ALTER TABLE users ADD COLUMN notify_deal_moved INTEGER DEFAULT 1`)
  console.log('users: added notify_deal_moved')
}
if (!usersCols.includes('notify_new_lead')) {
  db.exec(`ALTER TABLE users ADD COLUMN notify_new_lead INTEGER DEFAULT 1`)
  console.log('users: added notify_new_lead')
}

console.log('Notifications migration complete')
