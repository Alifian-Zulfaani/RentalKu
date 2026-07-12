const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'database.sqlite');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS site_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    business_name TEXT DEFAULT 'My Rental',
    tagline TEXT DEFAULT 'Sewa Peralatan Terlengkap',
    description TEXT,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#16a34a',
    secondary_color TEXT DEFAULT '#854d0e',
    whatsapp TEXT,
    email TEXT,
    address TEXT,
    hero_title TEXT,
    hero_subtitle TEXT,
    about_text TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    stock INTEGER DEFAULT 0,
    available_stock INTEGER DEFAULT 0,
    rate_daily REAL DEFAULT 0,
    rate_weekly REAL DEFAULT 0,
    rate_monthly REAL DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK(status IN ('active','maintenance','inactive')),
    image_url TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    whatsapp TEXT,
    address TEXT,
    id_card_url TEXT,
    is_blacklisted INTEGER DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'booking' CHECK(status IN ('booking','active','late','completed','cancelled')),
    start_date DATE,
    end_date DATE,
    total_amount REAL DEFAULT 0,
    paid_amount REAL DEFAULT 0,
    late_fee REAL DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    inventory_id INTEGER REFERENCES inventory(id) ON DELETE SET NULL,
    quantity INTEGER DEFAULT 1,
    rate_type TEXT CHECK(rate_type IN ('daily','weekly','monthly')),
    rate_amount REAL,
    subtotal REAL
  );
`);

module.exports = db;
