const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
process.env.DB_PATH = ":memory:";
process.env.JWT_SECRET = "test-secret-for-booking-api";
require("../src/seed");
const app = require("../src/server");
let server;
let base;
before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}/api`;
});
after(() => server.close());

async function request(path, options = {}) {
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  return { status: response.status, body: await response.json() };
}
function nextWorkingDay() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 7);
  while (date.getUTCDay() === 0) date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

test("halaman studio dan fotografer memakai tenant yang sama", async () => {
  const studio = await request("/public/site?tenant=studio");
  const person = await request("/public/site?tenant=studio&pro=naya");
  assert.equal(studio.status, 200);
  assert.equal(studio.body.profile, null);
  assert.equal(person.body.profile.slug, "naya");
  assert.equal(person.body.profile.photo_url, "/images/naya-portrait.png");
  assert.equal(
    person.body.profile.headline,
    "Potret yang terasa seperti pulang.",
  );
  assert.equal(person.body.tenant.id, studio.body.tenant.id);
});

test("slot terisi tidak dapat dibooking dua kali dan kembali tersedia setelah dibatalkan", async () => {
  const date = nextWorkingDay();
  const availability = await request(
    `/public/availability?tenant=studio&pro=naya&service=1&month=${date.slice(0, 7)}`,
  );
  const start_time = availability.body.days.find((day) => day.date === date)
    .slots[0];
  assert.ok(start_time);
  const payload = {
    tenant: "studio",
    pro: "naya",
    service_id: 1,
    date,
    start_time,
    customer_name: "Ayu Lestari",
    customer_email: "ayu@example.com",
    customer_whatsapp: "081234567890",
  };
  const first = await request("/public/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  assert.equal(first.status, 201);
  assert.equal(first.body.data.customer_name, payload.customer_name);
  assert.equal(first.body.data.service_name, "Portrait personal");
  assert.equal(first.body.data.professional_name, "Naya Putri");
  assert.equal(
    (
      await request("/public/bookings", {
        method: "POST",
        body: JSON.stringify(payload),
      })
    ).status,
    409,
  );
  const login = await request("/admin/login", {
    method: "POST",
    body: JSON.stringify({
      email: "admin@studiosenja.example",
      password: "admin123",
    }),
  });
  assert.equal(login.status, 200);
  const filtered = await request("/admin/bookings?search=Ayu", {
    headers: { Authorization: `Bearer ${login.body.token}` },
  });
  assert.equal(filtered.status, 200);
  assert.equal(filtered.body.pagination.total, 1);
  assert.equal(filtered.body.data[0].customer_name, "Ayu Lestari");
  const cancelled = await request(
    `/admin/bookings/${first.body.data.id}/status`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${login.body.token}` },
      body: JSON.stringify({ status: "cancelled" }),
    },
  );
  assert.equal(cancelled.status, 200);
  assert.equal(
    (
      await request("/public/bookings", {
        method: "POST",
        body: JSON.stringify(payload),
      })
    ).status,
    201,
  );
});

test("validasi pemesan dan akses admin", async () => {
  assert.equal((await request("/admin/bookings")).status, 401);
  assert.equal(
    (await request("/admin/login", { method: "POST", body: "{}" })).status,
    422,
  );
  assert.equal((await request("/public/site")).status, 422);
  assert.equal(
    (await request("/public/availability?tenant=studio&pro=naya")).status,
    422,
  );
  const invalid = await request("/public/bookings", {
    method: "POST",
    body: JSON.stringify({ date: "2020-01-01" }),
  });
  assert.equal(invalid.status, 422);
  assert.equal(invalid.body.errors[0].field, "customer_name");
});

test("admin dapat mengelola tenant, fotografer, dan layanan sendiri", async () => {
  const login = await request("/admin/login", {
    method: "POST",
    body: JSON.stringify({
      email: "admin@studiosenja.example",
      password: "admin123",
    }),
  });
  const headers = { Authorization: `Bearer ${login.body.token}` };
  const studio = await request("/admin/site", { headers });
  assert.equal(studio.body.slug, "studio");
  const person = await request("/admin/professionals", {
    method: "POST",
    headers,
    body: JSON.stringify({
      slug: "rina",
      name: "Rina Dewi",
      title: "Fotografer potret",
      bio: "Potret keluarga dan personal",
    }),
  });
  assert.equal(person.status, 201);
  const service = await request("/admin/services", {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: "Foto keluarga",
      description: "Sesi keluarga",
      duration_minutes: 90,
      price: 600000,
    }),
  });
  assert.equal(service.status, 201);
  const duplicate = await request("/admin/professionals", {
    method: "POST",
    headers,
    body: JSON.stringify({
      slug: "rina",
      name: "Rina Lain",
      title: "Fotografer",
      bio: "Portofolio",
    }),
  });
  assert.equal(duplicate.status, 409);
  const publicSite = await request("/public/site?tenant=studio&pro=rina");
  assert.equal(publicSite.body.profile.name, "Rina Dewi");
  assert.equal(
    publicSite.body.services.some((item) => item.name === "Foto keluarga"),
    true,
  );
});

test("harga per fotografer dan akses admin dibatasi sesuai role", async () => {
  const studio = await request("/public/site?tenant=studio");
  const naya = await request("/public/site?tenant=studio&pro=naya");
  const arya = await request("/public/site?tenant=studio&pro=arya");
  assert.equal(naya.status, 200);
  assert.equal(naya.body.schedule.length, 6);
  assert.ok(arya.body.services[0].price > naya.body.services[0].price);
  assert.ok(studio.body.professionals[0].price_from != null);
  const login = await request("/admin/login", {
    method: "POST",
    body: JSON.stringify({
      email: "naya@studiosenja.example",
      password: "naya123",
    }),
  });
  assert.equal(login.body.account.role, "photographer");
  const headers = { Authorization: `Bearer ${login.body.token}` };
  const me = await request("/admin/me", { headers });
  assert.equal(me.status, 200);
  assert.equal(me.body.tenant.whatsapp, "6281234567890");
  assert.equal((await request("/admin/services", { headers })).status, 403);
  assert.equal((await request("/admin/accounts", { headers })).status, 403);
  assert.equal(
    (await request("/admin/professionals", { headers })).body.data.length,
    1,
  );
  const ownOfferings = await request("/admin/offerings", { headers });
  assert.equal(ownOfferings.status, 200);
  const otherOfferings = await request("/admin/offerings?professional_id=2", {
    headers,
  });
  assert.equal(otherOfferings.status, 200);
  assert.equal(otherOfferings.body.professional_id, 1);
  const update = await request("/admin/offerings/1", {
    method: "PUT",
    headers,
    body: JSON.stringify({
      offerings: [{ service_id: 1, price: 525000, active: 1 }],
    }),
  });
  assert.equal(update.status, 200);
  assert.equal(
    (await request("/public/site?tenant=studio&pro=naya")).body.services.find(
      (item) => item.id === 1,
    ).price,
    525000,
  );
  const forbidden = await request("/admin/offerings/2", {
    method: "PUT",
    headers,
    body: JSON.stringify({ offerings: [] }),
  });
  assert.equal(forbidden.status, 403);
  const date = nextWorkingDay();
  const slot = (
    await request(
      `/public/availability?tenant=studio&pro=arya&service=1&month=${date.slice(0, 7)}`,
    )
  ).body.days.find((day) => day.date === date).slots[0];
  const aryaBooking = await request("/public/bookings", {
    method: "POST",
    body: JSON.stringify({
      tenant: "studio",
      pro: "arya",
      service_id: 1,
      date,
      start_time: slot,
      customer_name: "Bima Santoso",
      customer_email: "bima@example.com",
      customer_whatsapp: "081234567890",
    }),
  });
  assert.equal(aryaBooking.status, 201);
  assert.equal(
    (await request("/admin/bookings", { headers })).body.data.some(
      (item) => item.id === aryaBooking.body.data.id,
    ),
    false,
  );
  assert.equal(
    (
      await request(`/admin/bookings/${aryaBooking.body.data.id}/status`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status: "confirmed" }),
      })
    ).status,
    403,
  );
});
