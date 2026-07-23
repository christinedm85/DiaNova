import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const db = new Database(path.join(__dirname, 'creatorbloom.db'))

const tables = ['sponsorships', 'affiliates', 'leads', 'products', 'sent_emails', 'inbox_messages']

for (const t of tables) {
  const cols = db.prepare(`PRAGMA table_info(${t})`).all().map(c => c.name)
  if (cols.indexOf('user_id') === -1) {
    db.exec(`ALTER TABLE ${t} ADD COLUMN user_id INTEGER DEFAULT 1`)
    console.log(`${t}: added user_id`)
  }
  db.prepare(`UPDATE ${t} SET user_id = 1 WHERE user_id IS NULL OR user_id = 0`).run()
  console.log(`${t}: data migrated`)
}

console.log('Done — all tables now scoped to user_id')
