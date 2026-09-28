const { after, before, test } = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const jwt = require("jsonwebtoken");

const databasePath = path.join(
  os.tmpdir(),
  `rentalku-customer-api-${crypto.randomUUID()}.sqlite`,
);
process.env.DB_PATH = databasePath;
process.env.CORS_ORIGIN = "http://localhost:5174";

const app = require("../src/index");
const db = require("../src/config/database");
let server;
let baseUrl;

function futureDate(daysFromNow) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

before(() => {
  db.prepare("INSERT INTO categories (name) VALUES (?)").run("Tenda");
  db.prepare(
    `INSERT INTO inventory
      (name, category_id, stock, available_stock, rate_daily, rate_weekly, rate_monthly, status)
     VALUES ('Tenda Test', 1, 3, 3, 10000, 60000, 200000, 'active')`,
  ).run();
  server = app.listen(0);
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
});

after(() => {
  server.close();
  db.close();
  for (const suffix of ["", "-shm", "-wal"]) {
    fs.rmSync(`${databasePath}${suffix}`, { force: true });
  }
});

test("health check dan katalog publik tersedia", async () => {
  const health = await fetch(`${baseUrl}/health`).then((response) =>
    response.json(),
  );
  const products = await fetch(`${baseUrl}/public/products`).then((response) =>
    response.json(),
  );

  assert.equal(health.status, "ok");
  assert.equal(products[0].category_id, 1);
});

test("booking tidak valid mengembalikan detail validasi", async () => {
  const response = await fetch(`${baseUrl}/public/booking`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "A" }),
  });
  const body = await response.json();

  assert.equal(response.status, 422);
  assert.ok(body.errors.length > 0);
});

test("booking valid memakai kontrak respons frontend", async () => {
  const response = await fetch(`${baseUrl}/public/booking`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "Pelanggan Test",
      whatsapp: "081234567890",
      email: "test@example.com",
      start_date: futureDate(1),
      end_date: futureDate(3),
      items: [{ inventory_id: 1, quantity: 2 }],
    }),
  });
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.match(body.data.order_number, /^ORD-\d{8}-[A-F0-9]{6}$/);
  assert.equal(body.data.total_amount, 60000);
});

test("status order memakai PATCH dan mengembalikan stok saat selesai", async () => {
  const token = jwt.sign(
    { id: 1, name: "Admin Test", email: "admin@test.local" },
    "customer-rentalku-development-secret",
  );
  const order = db
    .prepare("SELECT id FROM orders ORDER BY id DESC LIMIT 1")
    .get();
  const requestStatus = (status) =>
    fetch(`${baseUrl}/orders/${order.id}/status`, {
      method: "PATCH",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

  assert.equal((await requestStatus("active")).status, 200);
  assert.equal((await requestStatus("completed")).status, 200);
  assert.equal(
    db.prepare("SELECT available_stock FROM inventory WHERE id = 1").get()
      .available_stock,
    3,
  );
});
