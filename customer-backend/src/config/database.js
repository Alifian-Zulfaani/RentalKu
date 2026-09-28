const Database = require("better-sqlite3");
const path = require("path");

const dbPath =
  process.env.DB_PATH || path.join(__dirname, "..", "..", "database.sqlite");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

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
    primary_color TEXT DEFAULT '#2f5948',
    secondary_color TEXT DEFAULT '#c66e46',
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

  CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category_id);
  CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
  CREATE INDEX IF NOT EXISTS idx_customers_whatsapp ON customers(whatsapp);
  CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
  CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
  CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
`);

// Migrate only the original starter palette; tenant-customized colors stay untouched.
db.prepare(
  `
  UPDATE site_config
  SET primary_color = '#2f5948', secondary_color = '#c66e46'
  WHERE primary_color = '#16a34a' AND secondary_color = '#854d0e'
`,
).run();

db.prepare(
  `
  UPDATE site_config
  SET tagline = 'Sewa Gear untuk Mendaki & Berkemah',
      description = 'Perlengkapan hiking dan camping yang terawat untuk perjalanan yang lebih ringan.',
      hero_title = 'Lebih ringan berangkat. Lebih jauh menjelajah.',
      hero_subtitle = 'Sewa perlengkapan hiking dan camping yang terawat. Pilih alat, tentukan tanggal, lalu tim kami menyiapkannya untuk perjalananmu.'
  WHERE hero_title = 'Siap Untuk Petualangan Berikutnya?'
    AND hero_subtitle = 'Sewa peralatan outdoor premium tanpa ribet. Semua lengkap, semua terawat.'
`,
).run();

module.exports = db;
