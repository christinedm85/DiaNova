import db from './db.js'

db.exec(`
  CREATE TABLE IF NOT EXISTS launch_circle_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    handle TEXT DEFAULT '',
    revenue_stage TEXT NOT NULL,
    follower_range TEXT NOT NULL,
    challenge TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

console.log('Migration: launch_circle_applications table ready.')
