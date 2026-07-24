import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const db = new Database(path.join(__dirname, 'creatorpilot.db'))

const tables = ['sponsorships', 'affiliates', 'leads', 'products', 'sent_emails', 'inbox_messages', 'content_ideas']

for (const t of tables) {
  const cols = db.prepare(`PRAGMA table_info(${t})`).all().map(c => c.name)
  if (cols.indexOf('user_id') === -1) {
    db.exec(`ALTER TABLE ${t} ADD COLUMN user_id INTEGER DEFAULT 1`)
    console.log(`${t}: added user_id`)
  }
  db.prepare(`UPDATE ${t} SET user_id = 1 WHERE user_id IS NULL OR user_id = 0`).run()
  console.log(`${t}: data migrated`)
}

// Migrate brand_settings from singleton to per-user model
const bsCols = db.prepare('PRAGMA table_info(brand_settings)').all().map(c => c.name)
if (bsCols.indexOf('user_id') === -1) {
  // Recreate brand_settings with user_id (drops old CHECK constraint)
  db.exec(`
    CREATE TABLE IF NOT EXISTS brand_settings_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      primary_color TEXT DEFAULT '#6366F1',
      accent_color TEXT DEFAULT '#F59E0B',
      neutral_color TEXT DEFAULT '#0F172A',
      pillars TEXT DEFAULT '["Content Creation","Creator Economy","Tech Reviews","Productivity"]',
      tone TEXT DEFAULT '["Educational","Authentic","Inspirational","Humorous"]',
      audience TEXT DEFAULT '["Aspiring Creators","Freelancers","Small Business"]',
      health_score INTEGER DEFAULT 78
    );
    INSERT INTO brand_settings_new (user_id, primary_color, accent_color, neutral_color, pillars, tone, audience, health_score)
      SELECT 1, primary_color, accent_color, neutral_color, pillars, tone, audience, health_score
      FROM brand_settings WHERE id = 1;
    DROP TABLE brand_settings;
    ALTER TABLE brand_settings_new RENAME TO brand_settings;
  `)
  console.log('brand_settings: migrated to per-user model')
}

console.log('Done — all tables now scoped to user_id')
