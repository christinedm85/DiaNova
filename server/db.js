import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const db = new Database(path.join(__dirname, 'creatorpilot.db'))

// Enable WAL mode for better concurrent reads
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// ── Create tables ──────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    plan TEXT DEFAULT 'free',
    onboarding_complete INTEGER DEFAULT 0,
    notify_deal_moved INTEGER DEFAULT 1,
    notify_new_lead INTEGER DEFAULT 1,
    email_verified INTEGER DEFAULT 0,
    verification_token TEXT DEFAULT NULL,
    reset_token TEXT DEFAULT NULL,
    reset_expires TEXT DEFAULT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sponsorships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand TEXT NOT NULL,
    amount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'prospecting',
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS affiliates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program TEXT NOT NULL,
    commission TEXT NOT NULL,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue REAL DEFAULT 0,
    trend TEXT DEFAULT '0%',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    source TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    price REAL NOT NULL,
    sales INTEGER DEFAULT 0,
    revenue REAL DEFAULT 0,
    trend TEXT DEFAULT '0%',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS brand_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    primary_color TEXT DEFAULT '#6366F1',
    accent_color TEXT DEFAULT '#F59E0B',
    neutral_color TEXT DEFAULT '#0F172A',
    pillars TEXT DEFAULT '["Content Creation","Creator Economy","Tech Reviews","Productivity"]',
    tone TEXT DEFAULT '["Educational","Authentic","Inspirational","Humorous"]',
    audience TEXT DEFAULT '["Aspiring Creators","Freelancers","Small Business"]',
    health_score INTEGER DEFAULT 78
  );

  CREATE TABLE IF NOT EXISTS content_ideas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    format TEXT NOT NULL,
    score INTEGER DEFAULT 85,
    reason TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS pricing_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month TEXT NOT NULL,
    avg_rate REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS conversions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    user_id INTEGER,
    metadata TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS error_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT,
    stack TEXT,
    route TEXT,
    method TEXT,
    user_id INTEGER,
    status_code INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sent_emails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    to_email TEXT NOT NULL,
    to_name TEXT DEFAULT '',
    subject TEXT DEFAULT '',
    body TEXT DEFAULT '',
    type TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS inbox_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    message_id TEXT,
    from_email TEXT DEFAULT '',
    from_name TEXT DEFAULT '',
    subject TEXT DEFAULT '',
    body TEXT DEFAULT '',
    read INTEGER DEFAULT 0,
    received_at TEXT DEFAULT (datetime('now')),
    created_at TEXT DEFAULT (datetime('now'))
  );
`)

// ── Seed data ──────────────────────────────────────────────

const sponsorCount = db.prepare('SELECT COUNT(*) as count FROM sponsorships').get()
if (sponsorCount.count === 0) {
  const seedSponsors = db.prepare('INSERT INTO sponsorships (brand, amount, status, notes) VALUES (?, ?, ?, ?)')
  const sponsors = [
    ['FitGear Co.', 2500, 'prospecting', 'Sent proposal'],
    ['MealPrep App', 1800, 'prospecting', 'Awaiting reply'],
    ['TravelNow', 4200, 'negotiating', 'Counter offer'],
    ['CloudHost', 3000, 'negotiating', 'Rate discussion'],
    ['BrandX', 3500, 'confirmed', 'Content due Jan 15'],
    ['TechWear', 5000, 'confirmed', 'Deliverables: 2 videos'],
    ['GamerFuel', 2800, 'completed', 'Paid'],
    ['StyleLab', 1900, 'completed', 'Paid'],
  ]
  for (const s of sponsors) seedSponsors.run(...s)
}

const affCount = db.prepare('SELECT COUNT(*) as count FROM affiliates').get()
if (affCount.count === 0) {
  const seedAff = db.prepare('INSERT INTO affiliates (program, commission, clicks, conversions, revenue, trend) VALUES (?, ?, ?, ?, ?, ?)')
  const affiliates = [
    ['TechGear Pro', '15%', 4200, 142, 1860, '+12%'],
    ['Creative Cloud', '8%', 3100, 89, 890, '+5%'],
    ['SkillMaster', '30%', 2800, 67, 720, '-2%'],
    ['HostFast', '$50 flat', 5400, 13, 650, '+18%'],
  ]
  for (const a of affiliates) seedAff.run(...a)
}

const leadCount = db.prepare('SELECT COUNT(*) as count FROM leads').get()
if (leadCount.count === 0) {
  const seedLead = db.prepare('INSERT INTO leads (name, email, source) VALUES (?, ?, ?)')
  const leads = [
    ['Sarah Chen', 'sarah@studio.co', 'Landing Page'],
    ['Marcus Webb', 'marcus@webb.media', 'YouTube Bio'],
    ['Priya Patel', 'priya@create.io', 'Newsletter CTA'],
    ['James Kim', 'james@kim.studio', 'Landing Page'],
    ['Olivia Ruiz', 'olivia@ruiz.art', 'Instagram Link'],
  ]
  for (const l of leads) seedLead.run(...l)
}

const prodCount = db.prepare('SELECT COUNT(*) as count FROM products').get()
if (prodCount.count === 0) {
  const seedProd = db.prepare('INSERT INTO products (title, type, price, sales, revenue, trend) VALUES (?, ?, ?, ?, ?, ?)')
  const products = [
    ['Creator Template Pack', 'Templates', 29, 142, 4118, '+8%'],
    ['Video Editing Presets', 'Presets', 19, 89, 1691, '+15%'],
    ['Brand Deal Playbook', 'Guide', 49, 56, 2744, '+22%'],
  ]
  for (const p of products) seedProd.run(...p)
}

const brandCount = db.prepare('SELECT COUNT(*) as count FROM brand_settings').get()
if (brandCount.count === 0) {
  db.prepare('INSERT INTO brand_settings DEFAULT VALUES').run()
}

const ideaCount = db.prepare('SELECT COUNT(*) as count FROM content_ideas').get()
if (ideaCount.count === 0) {
  const seedIdea = db.prepare('INSERT INTO content_ideas (title, format, score, reason) VALUES (?, ?, ?, ?)')
  const ideas = [
    ['How I Made $5K From One Brand Deal', 'YouTube Video', 92, 'Topical + monetization angle'],
    ['My Exact Affiliate Stack (Free Tools)', 'Blog / Newsletter', 88, 'Evergreen + affiliate potential'],
    ['Pricing Tier: When to Charge More', 'Thread / Carousel', 85, 'High save & share rate'],
    ['Behind the Scenes: Sponsor Negotiation', 'Short-form Video', 90, 'Trending format + authenticity'],
  ]
  for (const i of ideas) seedIdea.run(...i)
}

const priceHistCount = db.prepare('SELECT COUNT(*) as count FROM pricing_history').get()
if (priceHistCount.count === 0) {
  const seedPrice = db.prepare('INSERT INTO pricing_history (month, avg_rate) VALUES (?, ?)')
  const history = [
    ['Jan', 1800], ['Feb', 2100], ['Mar', 2400],
    ['Apr', 2200], ['May', 2800], ['Jun', 3100],
  ]
  for (const h of history) seedPrice.run(...h)
}

export default db
