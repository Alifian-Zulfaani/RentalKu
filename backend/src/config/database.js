const Database = require("better-sqlite3");
const path = require("path");

const dbPath = process.env.DB_PATH || path.join(__dirname, "..", "..", "database.sqlite");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Platform database: admins and early-access registrations.
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    business_name TEXT,
    business_type TEXT,
    subdomain TEXT,
    plan TEXT DEFAULT 'early_access',
    payment_method TEXT,
    amount REAL DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','confirmed','rejected')),
    confirmed_at DATETIME,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const subscriberColumns = db.prepare("PRAGMA table_info(subscribers)").all();
if (subscriberColumns.some((column) => column.name === "password")) {
  db.exec("ALTER TABLE subscribers DROP COLUMN password");
}
if (!subscriberColumns.some((column) => column.name === "product_type")) {
  db.exec("ALTER TABLE subscribers ADD COLUMN product_type TEXT NOT NULL DEFAULT 'rental'");
}

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_subscribers_email
  ON subscribers(email COLLATE NOCASE);

  CREATE INDEX IF NOT EXISTS idx_subscribers_subdomain
  ON subscribers(subdomain COLLATE NOCASE);

  CREATE INDEX IF NOT EXISTS idx_subscribers_status_created_at
  ON subscribers(status, created_at DESC);

  CREATE INDEX IF NOT EXISTS idx_subscribers_product_created_at
  ON subscribers(product_type, created_at DESC);
`);

module.exports = db;
