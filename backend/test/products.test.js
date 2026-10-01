const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
process.env.DB_PATH = ":memory:";
process.env.JWT_SECRET = "test-platform-secret";
const app = require("../src/index");
const { JWT_SECRET } = require("../src/middleware/auth");
let server;
let base;
before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}/api`;
});
after(() => server.close());
async function request(path, options = {}) {
  const response = await fetch(base + path, { ...options, headers: { "Content-Type": "application/json", ...options.headers } });
  return { status: response.status, body: await response.json() };
}

test("satu email bisa mendaftar untuk Rental dan Booking, tetapi tidak dua kali pada produk yang sama", async () => {
  const payload = { name: "Ayu Lestari", email: "ayu@example.com", whatsapp: "081234567890", business_name: "Studio Ayu", business_type: "Fotografi" };
  const rental = await request("/public/checkout", { method: "POST", body: JSON.stringify({ ...payload, product_type: "rental" }) });
  const booking = await request("/public/checkout", { method: "POST", body: JSON.stringify({ ...payload, product_type: "booking" }) });
  assert.equal(rental.status, 201);
  assert.equal(booking.status, 201);
  assert.equal(rental.body.data.product_type, "rental");
  assert.equal(booking.body.data.product_type, "booking");
  assert.equal((await request("/public/checkout", { method: "POST", body: JSON.stringify({ ...payload, product_type: "booking" }) })).status, 409);
});

test("admin memfilter satu tabel subscriber menurut produk", async () => {
  const token = jwt.sign({ id: 1 }, JWT_SECRET);
  for (const type of ["rental", "booking"]) {
    const response = await request(`/subscribers?product_type=${type}`, { headers: { Authorization: `Bearer ${token}` } });
    assert.equal(response.status, 200);
    assert.equal(response.body.pagination.total, 1);
    assert.equal(response.body.data[0].product_type, type);
  }
  const stats = await request("/subscribers/stats", { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(stats.body.byProduct.rental.total, 1);
  assert.equal(stats.body.byProduct.booking.total, 1);
});

test("tipe produk wajib valid", async () => {
  const response = await request("/public/checkout", { method: "POST", body: JSON.stringify({ name: "Ayu Lestari", email: "lain@example.com", whatsapp: "081234567890", business_name: "Bisnis Ayu", business_type: "Foto", product_type: "other" }) });
  assert.equal(response.status, 422);
  assert.equal(response.body.errors.some((item) => item.field === "product_type"), true);
});
