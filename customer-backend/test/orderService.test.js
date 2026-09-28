const { after, before, test } = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const databasePath = path.join(
  os.tmpdir(),
  `rentalku-customer-test-${crypto.randomUUID()}.sqlite`,
);
process.env.DB_PATH = databasePath;

const db = require("../src/config/database");
const {
  createOrder,
  getRentalDays,
  normalizeItems,
} = require("../src/services/orderService");

before(() => {
  db.prepare("INSERT INTO customers (name, whatsapp) VALUES (?, ?)").run(
    "Test Customer",
    "081234567890",
  );
  db.prepare("INSERT INTO categories (name) VALUES (?)").run("Test Gear");
  db.prepare(
    `INSERT INTO inventory
      (name, category_id, stock, available_stock, rate_daily, rate_weekly, rate_monthly, status)
     VALUES (?, 1, 3, 3, 10000, 60000, 200000, 'active')`,
  ).run("Test Tent");
});

after(() => {
  db.close();
  for (const suffix of ["", "-shm", "-wal"]) {
    fs.rmSync(`${databasePath}${suffix}`, { force: true });
  }
});

test("menghitung durasi sewa secara inklusif", () => {
  assert.equal(getRentalDays("2026-10-01", "2026-10-03"), 3);
  assert.throws(() => getRentalDays("2026-10-03", "2026-10-01"));
});

test("menggabungkan barang duplikat", () => {
  assert.deepEqual(
    normalizeItems([
      { inventory_id: 1, quantity: 1 },
      { inventory_id: 1, quantity: 2 },
    ]),
    [{ inventoryId: 1, quantity: 3, rateType: "daily" }],
  );
});

test("membuat order atomik, menghitung durasi, dan mereservasi stok", () => {
  const order = createOrder({
    customerId: 1,
    startDate: "2026-10-01",
    endDate: "2026-10-03",
    items: [{ inventory_id: 1, quantity: 2 }],
    notes: "Test",
  });

  assert.equal(order.total_amount, 60000);
  assert.equal(
    db.prepare("SELECT available_stock FROM inventory WHERE id = 1").get()
      .available_stock,
    1,
  );
});

test("menolak kekurangan stok tanpa membuat order parsial", () => {
  const beforeCount = db
    .prepare("SELECT COUNT(*) total FROM orders")
    .get().total;

  assert.throws(
    () =>
      createOrder({
        customerId: 1,
        startDate: "2026-10-05",
        endDate: "2026-10-05",
        items: [{ inventory_id: 1, quantity: 2 }],
      }),
    /Stok Test Tent tidak mencukupi/,
  );
  assert.equal(
    db.prepare("SELECT COUNT(*) total FROM orders").get().total,
    beforeCount,
  );
});
