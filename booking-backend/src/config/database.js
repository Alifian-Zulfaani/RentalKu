const Database = require("better-sqlite3");
const path = require("node:path");

const db = new Database(
  process.env.DB_PATH || path.join(__dirname, "..", "..", "database.sqlite"),
);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
const hadOfferings = Boolean(
  db
    .prepare(
      "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'professional_services'",
    )
    .get(),
);
db.exec(`
  CREATE TABLE IF NOT EXISTS tenants (
    id INTEGER PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    tagline TEXT NOT NULL,
    about TEXT NOT NULL,
    location TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    email TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS professionals (
    id INTEGER PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id),
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    bio TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    UNIQUE(tenant_id, slug)
  );
  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK(duration_minutes BETWEEN 30 AND 480),
    price INTEGER NOT NULL CHECK(price >= 0),
    active INTEGER NOT NULL DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS working_hours (
    id INTEGER PRIMARY KEY,
    professional_id INTEGER NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    weekday INTEGER NOT NULL CHECK(weekday BETWEEN 0 AND 6),
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    UNIQUE(professional_id, weekday)
  );
  CREATE TABLE IF NOT EXISTS professional_services (
    professional_id INTEGER NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    price INTEGER NOT NULL CHECK(price >= 0),
    active INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (professional_id, service_id)
  );
  CREATE TABLE IF NOT EXISTS blocks (
    id INTEGER PRIMARY KEY,
    professional_id INTEGER NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    reason TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id),
    professional_id INTEGER NOT NULL REFERENCES professionals(id),
    service_id INTEGER NOT NULL REFERENCES services(id),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_whatsapp TEXT NOT NULL,
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    total INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','completed','cancelled')),
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_bookings_slot ON bookings(professional_id, date, start_time, end_time, status);
  CREATE INDEX IF NOT EXISTS idx_bookings_tenant_date ON bookings(tenant_id, date);
  CREATE INDEX IF NOT EXISTS idx_blocks_slot ON blocks(professional_id, date);
`);
const tenantColumns = db.prepare("PRAGMA table_info(tenants)").all();
if (!tenantColumns.some((column) => column.name === "hero_image_url")) {
  db.exec(
    "ALTER TABLE tenants ADD COLUMN hero_image_url TEXT NOT NULL DEFAULT ''",
  );
}
const professionalColumns = db
  .prepare("PRAGMA table_info(professionals)")
  .all();
if (!professionalColumns.some((column) => column.name === "photo_url")) {
  db.exec(
    "ALTER TABLE professionals ADD COLUMN photo_url TEXT NOT NULL DEFAULT ''",
  );
}
for (const column of ["headline", "approach"]) {
  if (!professionalColumns.some((item) => item.name === column)) {
    db.exec(
      `ALTER TABLE professionals ADD COLUMN ${column} TEXT NOT NULL DEFAULT ''`,
    );
  }
}
const adminColumns = db.prepare("PRAGMA table_info(admins)").all();
if (!adminColumns.some((column) => column.name === "role")) {
  db.exec("ALTER TABLE admins ADD COLUMN role TEXT NOT NULL DEFAULT 'company'");
}
if (!adminColumns.some((column) => column.name === "professional_id")) {
  db.exec(
    "ALTER TABLE admins ADD COLUMN professional_id INTEGER REFERENCES professionals(id)",
  );
}
if (!hadOfferings) {
  db.exec(`INSERT OR IGNORE INTO professional_services (professional_id, service_id, price)
    SELECT p.id, s.id, s.price FROM professionals p JOIN services s ON s.tenant_id = p.tenant_id`);
}
db.exec(
  "CREATE INDEX IF NOT EXISTS idx_professional_services_service ON professional_services(service_id)",
);

module.exports = db;
