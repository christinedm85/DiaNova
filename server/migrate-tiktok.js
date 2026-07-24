import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const db = new Database(path.join(__dirname, 'creatorpilot.db'))

db.exec(`
  CREATE TABLE IF NOT EXISTS tiktok_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TEXT,
    open_id TEXT,
    creator_username TEXT,
    display_name TEXT,
    avatar_url TEXT,
    follower_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS tiktok_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    cache_key TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, cache_key)
  );
`)

console.log('TikTok tables created')
