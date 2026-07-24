import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const db = new Database(path.join(__dirname, 'creatorpilot.db'))

db.exec(`
  CREATE TABLE IF NOT EXISTS monetization_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    stripe_key_encrypted TEXT,
    shopify_url TEXT,
    shopify_token_encrypted TEXT,
    stripe_connected INTEGER DEFAULT 0,
    shopify_connected INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS monetization_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    cache_key TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, cache_key)
  );
`)

console.log('Monetization tables created')
