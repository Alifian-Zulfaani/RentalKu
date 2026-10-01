const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");

process.env.DB_PATH = ":memory:";
process.env.JWT_SECRET = "test-platform-secret";

const app = require("../src/index");
const db = require("../src/config/database");
let server;
let base;
let token;

const payload = {
  name: "Ayu Lestari",
  email: "ayu@example.com",
  whatsapp: "081234567890",
  business_name: "Studio Ayu",
  business_type: "Fotografi",
};

before(async () => {
  db.prepare("INSERT INTO admins (name, email, password) VALUES (?, ?, ?)")
    .run("Admin", "admin@example.com", bcrypt.hashSync("very-secure-test-password", 10));
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  db.close();
});

async function request(path, options = {}) {
  const response = await fetch(base + path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  return {
    status: response.status,
    contentType: response.headers.get("content-type"),
    body: response.status === 204 ? null : await response.json(),
  };
}

function adminHeaders() {
  return { Authorization: `Bearer ${token}` };
}

test("health dan autentikasi memakai amplop data yang konsisten", async () => {
  const health = await request("/health");
  assert.deepEqual(health.body, { data: { status: "ok" } });

  const unauthorized = await request("/subscribers");
  assert.equal(unauthorized.status, 401);
  assert.match(unauthorized.contentType, /application\/problem\+json/);
  assert.equal(unauthorized.body.status, 401);

  const login = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "ADMIN@example.com", password: "very-secure-test-password" }),
  });
  assert.equal(login.status, 200);
  assert.ok(login.body.data.token);
  assert.equal(login.body.data.admin.email, "admin@example.com");
  token = login.body.data.token;

  const me = await request("/auth/me", { headers: adminHeaders() });
  assert.equal(me.body.data.email, "admin@example.com");
  assert.match(me.body.data.created_at, /Z$/);
});

test("statistik kosong mengembalikan angka nol, bukan null", async () => {
  const response = await request("/subscribers/stats", { headers: adminHeaders() });
  assert.equal(response.status, 200);
  assert.equal(response.body.data.totalSubscribers, 0);
  assert.deepEqual(response.body.data.byProduct.rental, { total: 0, pending: 0, confirmed: 0 });
  assert.deepEqual(response.body.data.byProduct.booking, { total: 0, pending: 0, confirmed: 0 });
});

test("Rental dan Booking boleh memakai email sama, tetapi tiap produk hanya sekali", async () => {
  const rental = await request("/public/checkout", {
    method: "POST",
    body: JSON.stringify({ ...payload, product_type: "rental", plan: "paid", amount: 999999, payment_method: "transfer" }),
  });
  const booking = await request("/public/checkout", {
    method: "POST",
    body: JSON.stringify({ ...payload, product_type: "booking" }),
  });
  assert.equal(rental.status, 201);
  assert.equal(booking.status, 201);
  assert.equal(rental.body.data.amount, 0);
  assert.equal(rental.body.data.plan, "early_access");
  assert.equal(rental.body.data.payment_method, null);
  assert.equal(rental.body.data.status, "pending");
  assert.match(rental.body.data.created_at, /Z$/);
  assert.equal(booking.body.data.product_type, "booking");

  const duplicate = await request("/public/checkout", {
    method: "POST",
    body: JSON.stringify({ ...payload, email: "AYU@example.com", product_type: "booking" }),
  });
  assert.equal(duplicate.status, 409);
  assert.match(duplicate.contentType, /application\/problem\+json/);
  assert.equal(duplicate.body.errors[0].field, "email");
});

test("validasi, JSON rusak, dan endpoint tidak dikenal memakai Problem Details", async () => {
  const invalid = await request("/public/checkout", {
    method: "POST",
    body: JSON.stringify({ ...payload, product_type: "other", whatsapp: "abc" }),
  });
  assert.equal(invalid.status, 422);
  assert.equal(invalid.body.type, "about:blank");
  assert.equal(invalid.body.errors.some((item) => item.field === "product_type"), true);

  const malformed = await request("/public/checkout", { method: "POST", body: "{" });
  assert.equal(malformed.status, 400);
  assert.match(malformed.contentType, /application\/problem\+json/);

  const missing = await request("/missing");
  assert.equal(missing.status, 404);
  assert.equal(missing.body.instance, "/api/missing");
});

test("admin memfilter, mencari, memperbarui, dan menghapus pendaftar", async () => {
  const rental = await request("/subscribers?product_type=rental&page=1&limit=1", { headers: adminHeaders() });
  assert.equal(rental.status, 200);
  assert.equal(rental.body.meta.pagination.total, 1);
  assert.equal(rental.body.meta.pagination.totalPages, 1);
  assert.equal(rental.body.data[0].product_type, "rental");

  const booking = await request("/subscribers?product_type=booking&search=Studio", { headers: adminHeaders() });
  assert.equal(booking.body.meta.pagination.total, 1);
  const id = booking.body.data[0].id;

  const searchLiteral = await request("/subscribers?search=%25", { headers: adminHeaders() });
  assert.equal(searchLiteral.body.meta.pagination.total, 0);

  const details = await request(`/subscribers/${id}`, { headers: adminHeaders() });
  assert.equal(details.body.data.id, id);

  const approved = await request(`/subscribers/${id}/status`, {
    method: "PATCH",
    headers: adminHeaders(),
    body: JSON.stringify({ status: "confirmed", notes: "Sudah dihubungi" }),
  });
  assert.equal(approved.status, 200);
  assert.equal(approved.body.data.status, "confirmed");
  assert.match(approved.body.data.confirmed_at, /Z$/);

  const removed = await request(`/subscribers/${id}`, { method: "DELETE", headers: adminHeaders() });
  assert.equal(removed.status, 204);
  assert.equal(removed.body, null);
  const gone = await request(`/subscribers/${id}`, { headers: adminHeaders() });
  assert.equal(gone.status, 404);
});

test("subdomain bisnis yang sama tetap unik dan panjangnya dibatasi", async () => {
  const business_name = "Peralatan Outdoor Untuk Petualangan Nusantara";
  const first = await request("/public/checkout", {
    method: "POST",
    body: JSON.stringify({ ...payload, email: "satu@example.com", business_name, product_type: "rental" }),
  });
  const second = await request("/public/checkout", {
    method: "POST",
    body: JSON.stringify({ ...payload, email: "dua@example.com", business_name, product_type: "rental" }),
  });
  assert.equal(first.status, 201);
  assert.equal(second.status, 201);
  assert.notEqual(first.body.data.subdomain, second.body.data.subdomain);
  assert.ok(second.body.data.subdomain.length <= 20);
});
