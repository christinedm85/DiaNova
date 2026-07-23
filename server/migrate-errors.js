import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const db = new Database(path.join(__dirname, 'creatorbloom.db'))

db.exec(`
  CREATE TABLE IF NOT EXISTS error_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT NOT NULL,
    stack TEXT,
    route TEXT,
    method TEXT,
    user_id INTEGER,
    status_code INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
  );
`)

console.log('Error logs table created')
