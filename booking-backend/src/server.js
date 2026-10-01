const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");
const {
  validDate,
  timePattern,
  toMinutes,
  toTime,
  today,
  slotsForDay,
  isAvailable,
} = require("./scheduling");

const app = express();
if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET)
  throw new Error("JWT_SECRET wajib diisi pada production");
const allowedOrigins = (
  process.env.CORS_ORIGIN || "http://localhost:5175,http://*.localhost:5175"
)
  .split(",")
  .map((origin) => origin.trim());
function isAllowedOrigin(origin) {
  if (!origin) return true;
  return allowedOrigins.some((allowed) => {
    if (origin === allowed) return true;
    if (!allowed.includes("*.")) return false;
    try {
      const actual = new URL(origin);
      const pattern = new URL(allowed.replace("*.", ""));
      return (
        actual.protocol === pattern.protocol &&
        actual.port === pattern.port &&
        actual.hostname.endsWith(`.${pattern.hostname}`)
      );
    } catch {
      return false;
    }
  });
}
app.use(
  cors({
    origin(origin, callback) {
      callback(null, isAllowedOrigin(origin));
    },
  }),
);
app.use(express.json({ limit: "32kb" }));

function error(status, message, field) {
  const issue = new Error(message);
  issue.status = status;
  if (field) issue.errors = [{ field, message }];
  throw issue;
}
function route(handler) {
  return (req, res, next) => {
    try {
      Promise.resolve(handler(req, res)).catch(next);
    } catch (cause) {
      next(cause);
    }
  };
}
function tenantBySlug(slug) {
  const tenant = db.prepare("SELECT * FROM tenants WHERE slug = ?").get(slug);
  if (!tenant) error(404, "Bisnis tidak ditemukan");
  return tenant;
}
function professionalFor(tenantId, slug) {
  const professional = db
    .prepare(
      "SELECT * FROM professionals WHERE tenant_id = ? AND slug = ? AND active = 1",
    )
    .get(tenantId, slug);
  if (!professional) error(404, "Fotografer tidak ditemukan");
  return professional;
}
function serviceFor(tenantId, id) {
  const service = db
    .prepare(
      "SELECT * FROM services WHERE tenant_id = ? AND id = ? AND active = 1",
    )
    .get(tenantId, id);
  if (!service) error(404, "Layanan tidak ditemukan");
  return service;
}
function offeringFor(professionalId, serviceId) {
  const offering = db
    .prepare(
      "SELECT price FROM professional_services WHERE professional_id = ? AND service_id = ? AND active = 1",
    )
    .get(professionalId, serviceId);
  if (!offering) error(404, "Layanan tidak tersedia untuk fotografer ini");
  return offering;
}
function admin(req, _res, next) {
  try {
    const token = req.headers.authorization?.replace(/^Bearer /i, "");
    if (!token) error(401, "Silakan masuk sebagai admin");
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "development-only-change-me",
    );
    const account = db
      .prepare(
        "SELECT id, tenant_id, role, professional_id, email FROM admins WHERE id = ?",
      )
      .get(payload.adminId);
    if (!account || account.tenant_id !== payload.tenantId)
      error(401, "Sesi tidak valid");
    req.account = account;
    req.tenantId = account.tenant_id;
    req.professionalId =
      account.role === "photographer" ? account.professional_id : null;
    if (account.role === "photographer" && !account.professional_id)
      error(401, "Akun fotografer belum terhubung");
    next();
  } catch (_cause) {
    next(Object.assign(new Error("Sesi tidak valid"), { status: 401 }));
  }
}
function company(req, _res, next) {
  if (req.account.role !== "company")
    return next(
      Object.assign(
        new Error("Hanya admin studio yang dapat mengakses menu ini"),
        { status: 403 },
      ),
    );
  next();
}
function permittedProfessional(req, id) {
  if (req.professionalId && Number(id) !== req.professionalId)
    error(403, "Anda hanya dapat mengelola data sendiri");
}
function validateBooking(body) {
  for (const [field, label, min, max] of [
    ["customer_name", "Nama", 2, 100],
    ["customer_email", "Email", 5, 150],
    ["customer_whatsapp", "WhatsApp", 9, 20],
  ]) {
    if (
      typeof body[field] !== "string" ||
      body[field].trim().length < min ||
      body[field].trim().length > max
    )
      error(422, `${label} tidak valid`, field);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customer_email))
    error(422, "Email tidak valid", "customer_email");
  if (!/^(?:\+62|62|0)8\d{7,12}$/.test(body.customer_whatsapp))
    error(422, "WhatsApp tidak valid", "customer_whatsapp");
  if (!validDate(body.date) || body.date < today())
    error(422, "Pilih tanggal yang belum lewat", "date");
  if (!timePattern.test(body.start_time))
    error(422, "Pilih jam yang tersedia", "start_time");
}

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.get(
  "/api/public/site",
  route((req, res) => {
    const tenant = tenantBySlug(req.query.tenant);
    const professionals = db
      .prepare(
        `SELECT p.id, p.slug, p.name, p.title, p.bio, p.photo_url, p.headline,
          MIN(CASE WHEN ps.active = 1 AND s.active = 1 THEN ps.price END) AS price_from,
          MAX(CASE WHEN ps.active = 1 AND s.active = 1 THEN ps.price END) AS price_to
          FROM professionals p LEFT JOIN professional_services ps ON ps.professional_id = p.id
          LEFT JOIN services s ON s.id = ps.service_id
          WHERE p.tenant_id = ? AND p.active = 1 GROUP BY p.id ORDER BY p.id`,
      )
      .all(tenant.id);
    const profile = req.query.pro
      ? professionalFor(tenant.id, req.query.pro)
      : null;
    const services = db
      .prepare(
        `SELECT s.id, s.name, s.description, s.duration_minutes, ps.price, ps.professional_id
      FROM services s JOIN professional_services ps ON ps.service_id = s.id
      JOIN professionals p ON p.id = ps.professional_id
      WHERE s.tenant_id = ? AND s.active = 1 AND ps.active = 1 AND p.active = 1
      ${profile ? "AND p.id = ?" : ""} ORDER BY s.id, p.id`,
      )
      .all(...(profile ? [tenant.id, profile.id] : [tenant.id]));
    const schedule = profile
      ? db
          .prepare(
            "SELECT weekday, start_time, end_time FROM working_hours WHERE professional_id = ? ORDER BY weekday",
          )
          .all(profile.id)
      : [];
    res.json({ tenant, profile, professionals, services, schedule });
  }),
);
app.get(
  "/api/public/availability",
  route((req, res) => {
    const tenant = tenantBySlug(req.query.tenant);
    const professional = professionalFor(tenant.id, req.query.pro);
    const service = serviceFor(tenant.id, Number(req.query.service));
    offeringFor(professional.id, service.id);
    const month = String(req.query.month || "");
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))
      error(422, "Bulan tidak valid", "month");
    const daysInMonth = new Date(
      Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5)), 0),
    ).getUTCDate();
    const days = Array.from({ length: daysInMonth }, (_, index) => {
      const date = `${month}-${String(index + 1).padStart(2, "0")}`;
      const slots = slotsForDay(
        professional.id,
        date,
        service.duration_minutes,
      );
      return { date, slots, available: slots.length > 0 };
    });
    res.json({ month, days });
  }),
);
app.post(
  "/api/public/bookings",
  route((req, res) => {
    validateBooking(req.body);
    const tenant = tenantBySlug(req.body.tenant);
    const professional = professionalFor(tenant.id, req.body.pro);
    const service = serviceFor(tenant.id, Number(req.body.service_id));
    const offering = offeringFor(professional.id, service.id);
    const booking = db.transaction(() => {
      const slots = slotsForDay(
        professional.id,
        req.body.date,
        service.duration_minutes,
      );
      if (!slots.includes(req.body.start_time))
        error(
          409,
          "Slot ini sudah tidak tersedia. Pilih jam lain.",
          "start_time",
        );
      const endTime = toTime(
        toMinutes(req.body.start_time) + service.duration_minutes,
      );
      const result = db
        .prepare(
          `INSERT INTO bookings (tenant_id, professional_id, service_id, customer_name, customer_email, customer_whatsapp, date, start_time, end_time, total, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          tenant.id,
          professional.id,
          service.id,
          req.body.customer_name.trim(),
          req.body.customer_email.trim().toLowerCase(),
          req.body.customer_whatsapp.trim(),
          req.body.date,
          req.body.start_time,
          endTime,
          offering.price,
          String(req.body.notes || "")
            .trim()
            .slice(0, 1000),
        );
      return db
        .prepare(
          "SELECT id, date, start_time, end_time, total, status FROM bookings WHERE id = ?",
        )
        .get(result.lastInsertRowid);
    })();
    res.status(201).json({
      message: "Reservasi diterima dan menunggu konfirmasi.",
      data: booking,
    });
  }),
);

app.post(
  "/api/admin/login",
  route((req, res) => {
    const account = db
      .prepare("SELECT * FROM admins WHERE email = ? COLLATE NOCASE")
      .get(req.body.email);
    if (
      !account ||
      !bcrypt.compareSync(
        String(req.body.password || ""),
        account.password_hash,
      )
    )
      error(401, "Email atau kata sandi salah");
    const token = jwt.sign(
      { adminId: account.id, tenantId: account.tenant_id },
      process.env.JWT_SECRET || "development-only-change-me",
      { expiresIn: "12h" },
    );
    res.json({
      token,
      account: {
        id: account.id,
        email: account.email,
        role: account.role,
        professional_id: account.professional_id,
      },
      tenant: db
        .prepare("SELECT id, slug, name FROM tenants WHERE id = ?")
        .get(account.tenant_id),
    });
  }),
);
app.use("/api/admin", admin);
app.get(
  "/api/admin/me",
  route((req, res) => {
    const professional = req.professionalId
      ? db
          .prepare(
            "SELECT id, slug, name, title, bio, photo_url, headline, approach FROM professionals WHERE id = ? AND tenant_id = ?",
          )
          .get(req.professionalId, req.tenantId)
      : null;
    res.json({
      account: req.account,
      professional,
      tenant: db
        .prepare("SELECT id, slug, name FROM tenants WHERE id = ?")
        .get(req.tenantId),
    });
  }),
);
app.get(
  "/api/admin/overview",
  route((req, res) => {
    const scope = req.professionalId ? " AND professional_id = ?" : "";
    const args = req.professionalId
      ? [req.tenantId, req.professionalId]
      : [req.tenantId];
    const counts = db
      .prepare(
        `SELECT COUNT(*) AS total, SUM(status = 'pending') AS pending, SUM(status = 'confirmed') AS confirmed FROM bookings WHERE tenant_id = ?${scope}`,
      )
      .get(...args);
    const recent = db
      .prepare(
        `SELECT b.id, b.date, b.start_time, b.customer_name, b.status, b.total, p.name AS professional_name, s.name AS service_name FROM bookings b JOIN professionals p ON p.id = b.professional_id JOIN services s ON s.id = b.service_id WHERE b.tenant_id = ?${req.professionalId ? " AND b.professional_id = ?" : ""} ORDER BY b.created_at DESC, b.id DESC LIMIT 5`,
      )
      .all(...args);
    res.json({ counts, recent });
  }),
);
app.get(
  "/api/admin/bookings",
  route((req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = 10;
    const status = ["pending", "confirmed", "completed", "cancelled"].includes(
      req.query.status,
    )
      ? req.query.status
      : null;
    const where =
      "WHERE b.tenant_id = ?" +
      (req.professionalId ? " AND b.professional_id = ?" : "") +
      (status ? " AND b.status = ?" : "");
    const args = [
      req.tenantId,
      ...(req.professionalId ? [req.professionalId] : []),
      ...(status ? [status] : []),
    ];
    const total = db
      .prepare(`SELECT COUNT(*) AS count FROM bookings b ${where}`)
      .get(...args).count;
    const data = db
      .prepare(
        `SELECT b.*, p.name AS professional_name, s.name AS service_name FROM bookings b JOIN professionals p ON p.id = b.professional_id JOIN services s ON s.id = b.service_id ${where} ORDER BY b.date DESC, b.start_time DESC LIMIT ? OFFSET ?`,
      )
      .all(...args, limit, (page - 1) * limit);
    res.json({
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }),
);
app.patch(
  "/api/admin/bookings/:id/status",
  route((req, res) => {
    if (
      !["pending", "confirmed", "completed", "cancelled"].includes(
        req.body.status,
      )
    )
      error(422, "Status tidak valid", "status");
    const booking = db
      .prepare("SELECT * FROM bookings WHERE id = ? AND tenant_id = ?")
      .get(req.params.id, req.tenantId);
    if (!booking) error(404, "Reservasi tidak ditemukan");
    permittedProfessional(req, booking.professional_id);
    if (
      booking.status === "cancelled" &&
      req.body.status !== "cancelled" &&
      !isAvailable(
        booking.professional_id,
        booking.date,
        booking.start_time,
        booking.end_time,
      )
    )
      error(409, "Slot sudah terisi oleh reservasi lain");
    db.prepare("UPDATE bookings SET status = ? WHERE id = ?").run(
      req.body.status,
      booking.id,
    );
    res.json({ message: "Status reservasi diperbarui" });
  }),
);
app.get(
  "/api/admin/professionals",
  route((req, res) => {
    const data = db
      .prepare(
        `SELECT id, slug, name, title, bio, photo_url, headline, approach, active FROM professionals WHERE tenant_id = ?${req.professionalId ? " AND id = ?" : ""} ORDER BY id`,
      )
      .all(
        ...(req.professionalId
          ? [req.tenantId, req.professionalId]
          : [req.tenantId]),
      );
    const schedules = db.prepare(
      "SELECT weekday, start_time, end_time FROM working_hours WHERE professional_id = ? ORDER BY weekday",
    );
    res.json({
      data: data.map((person) => ({
        ...person,
        schedule: schedules.all(person.id),
      })),
    });
  }),
);
app.put(
  "/api/admin/professionals/:id/schedule",
  route((req, res) => {
    permittedProfessional(req, req.params.id);
    const person = db
      .prepare("SELECT id FROM professionals WHERE id = ? AND tenant_id = ?")
      .get(req.params.id, req.tenantId);
    if (!person) error(404, "Fotografer tidak ditemukan");
    if (
      !Array.isArray(req.body.schedule) ||
      req.body.schedule.length > 7 ||
      new Set(req.body.schedule.map((item) => item.weekday)).size !==
        req.body.schedule.length
    )
      error(422, "Jadwal tidak valid", "schedule");
    for (const item of req.body.schedule)
      if (
        !Number.isInteger(item.weekday) ||
        item.weekday < 0 ||
        item.weekday > 6 ||
        !timePattern.test(item.start_time) ||
        !timePattern.test(item.end_time) ||
        item.start_time >= item.end_time
      )
        error(422, "Jam kerja tidak valid", "schedule");
    db.transaction(() => {
      db.prepare("DELETE FROM working_hours WHERE professional_id = ?").run(
        person.id,
      );
      const insert = db.prepare(
        "INSERT INTO working_hours (professional_id, weekday, start_time, end_time) VALUES (?, ?, ?, ?)",
      );
      for (const item of req.body.schedule)
        insert.run(person.id, item.weekday, item.start_time, item.end_time);
    })();
    res.json({ message: "Jadwal kerja disimpan" });
  }),
);
app.get(
  "/api/admin/services",
  company,
  route((req, res) =>
    res.json({
      data: db
        .prepare("SELECT * FROM services WHERE tenant_id = ? ORDER BY id")
        .all(req.tenantId),
    }),
  ),
);
app.get(
  "/api/admin/site",
  route((req, res) =>
    res.json(
      db.prepare("SELECT * FROM tenants WHERE id = ?").get(req.tenantId),
    ),
  ),
);
app.patch(
  "/api/admin/site",
  company,
  route((req, res) => {
    const fields = [
      "name",
      "tagline",
      "about",
      "location",
      "whatsapp",
      "email",
      "hero_image_url",
    ];
    const previous = db
      .prepare("SELECT * FROM tenants WHERE id = ?")
      .get(req.tenantId);
    const values = Object.fromEntries(
      fields.map((field) => [
        field,
        req.body[field] === undefined
          ? previous[field]
          : String(req.body[field]).trim(),
      ]),
    );
    for (const field of fields.filter((field) => field !== "hero_image_url"))
      if (!values[field] || values[field].length > 1000)
        error(422, `${field} tidak valid`, field);
    if (
      values.hero_image_url &&
      !/^https:\/\//.test(values.hero_image_url) &&
      !values.hero_image_url.startsWith("/images/")
    )
      error(422, "URL foto harus HTTPS atau path /images/", "hero_image_url");
    db.prepare(
      "UPDATE tenants SET name = ?, tagline = ?, about = ?, location = ?, whatsapp = ?, email = ?, hero_image_url = ? WHERE id = ?",
    ).run(...fields.map((field) => values[field]), req.tenantId);
    res.json({
      message: "Profil studio disimpan",
      data: db.prepare("SELECT * FROM tenants WHERE id = ?").get(req.tenantId),
    });
  }),
);
function validateProfessional(body) {
  for (const field of ["name", "title", "bio"])
    if (
      typeof body[field] !== "string" ||
      !body[field].trim() ||
      body[field].length > 1000
    )
      error(422, `${field} tidak valid`, field);
  for (const field of ["headline", "approach"])
    if (
      body[field] !== undefined &&
      (typeof body[field] !== "string" || body[field].length > 1000)
    )
      error(422, `${field} tidak valid`, field);
  if (!/^[a-z0-9-]{2,40}$/.test(body.slug || ""))
    error(422, "Slug fotografer tidak valid", "slug");
  if (
    body.photo_url &&
    !/^https:\/\//.test(body.photo_url) &&
    !body.photo_url.startsWith("/images/")
  )
    error(422, "URL foto harus HTTPS atau path /images/", "photo_url");
}
app.post(
  "/api/admin/professionals",
  company,
  route((req, res) => {
    validateProfessional(req.body);
    const result = db.transaction(() => {
      const inserted = db
        .prepare(
          "INSERT INTO professionals (tenant_id, slug, name, title, bio, photo_url, headline, approach) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .run(
          req.tenantId,
          req.body.slug,
          req.body.name.trim(),
          req.body.title.trim(),
          req.body.bio.trim(),
          String(req.body.photo_url || "").trim(),
          String(req.body.headline || "").trim(),
          String(req.body.approach || "").trim(),
        );
      db.prepare(
        `INSERT INTO professional_services (professional_id, service_id, price)
        SELECT ?, id, price FROM services WHERE tenant_id = ? AND active = 1`,
      ).run(inserted.lastInsertRowid, req.tenantId);
      return inserted;
    })();
    res
      .status(201)
      .json({ id: result.lastInsertRowid, message: "Fotografer ditambahkan" });
  }),
);
app.patch(
  "/api/admin/professionals/:id",
  route((req, res) => {
    permittedProfessional(req, req.params.id);
    const previous = db
      .prepare("SELECT * FROM professionals WHERE id = ? AND tenant_id = ?")
      .get(req.params.id, req.tenantId);
    if (!previous) error(404, "Fotografer tidak ditemukan");
    const values = { ...previous, ...req.body };
    if (req.professionalId) {
      values.slug = previous.slug;
      values.active = previous.active;
    }
    validateProfessional(values);
    db.prepare(
      "UPDATE professionals SET slug = ?, name = ?, title = ?, bio = ?, photo_url = ?, headline = ?, approach = ?, active = ? WHERE id = ?",
    ).run(
      values.slug,
      values.name.trim(),
      values.title.trim(),
      values.bio.trim(),
      String(values.photo_url || "").trim(),
      String(values.headline || "").trim(),
      String(values.approach || "").trim(),
      values.active ? 1 : 0,
      previous.id,
    );
    res.json({ message: "Profil fotografer disimpan" });
  }),
);
function validateService(body) {
  if (
    typeof body.name !== "string" ||
    body.name.trim().length < 2 ||
    body.name.length > 100
  )
    error(422, "Nama layanan tidak valid", "name");
  if (typeof body.description !== "string" || body.description.length > 1000)
    error(422, "Deskripsi tidak valid", "description");
  if (
    !Number.isInteger(Number(body.duration_minutes)) ||
    Number(body.duration_minutes) < 30 ||
    Number(body.duration_minutes) > 480 ||
    Number(body.duration_minutes) % 30 !== 0
  )
    error(422, "Durasi harus kelipatan 30 menit", "duration_minutes");
  if (!Number.isInteger(Number(body.price)) || Number(body.price) < 0)
    error(422, "Harga tidak valid", "price");
}
app.post(
  "/api/admin/services",
  company,
  route((req, res) => {
    validateService(req.body);
    const result = db.transaction(() => {
      const inserted = db
        .prepare(
          "INSERT INTO services (tenant_id, name, description, duration_minutes, price) VALUES (?, ?, ?, ?, ?)",
        )
        .run(
          req.tenantId,
          req.body.name.trim(),
          req.body.description.trim(),
          Number(req.body.duration_minutes),
          Number(req.body.price),
        );
      db.prepare(
        `INSERT INTO professional_services (professional_id, service_id, price)
        SELECT id, ?, ? FROM professionals WHERE tenant_id = ? AND active = 1`,
      ).run(inserted.lastInsertRowid, Number(req.body.price), req.tenantId);
      return inserted;
    })();
    res
      .status(201)
      .json({ id: result.lastInsertRowid, message: "Layanan ditambahkan" });
  }),
);
app.patch(
  "/api/admin/services/:id",
  company,
  route((req, res) => {
    const previous = db
      .prepare("SELECT * FROM services WHERE id = ? AND tenant_id = ?")
      .get(req.params.id, req.tenantId);
    if (!previous) error(404, "Layanan tidak ditemukan");
    const values = { ...previous, ...req.body };
    validateService(values);
    db.prepare(
      "UPDATE services SET name = ?, description = ?, duration_minutes = ?, price = ?, active = ? WHERE id = ?",
    ).run(
      values.name.trim(),
      values.description.trim(),
      Number(values.duration_minutes),
      Number(values.price),
      values.active ? 1 : 0,
      previous.id,
    );
    res.json({ message: "Layanan disimpan" });
  }),
);
app.get(
  "/api/admin/offerings",
  route((req, res) => {
    const professionalId =
      req.professionalId || Number(req.query.professional_id);
    if (!professionalId) error(422, "Pilih fotografer", "professional_id");
    const person = db
      .prepare("SELECT id FROM professionals WHERE id = ? AND tenant_id = ?")
      .get(professionalId, req.tenantId);
    if (!person) error(404, "Fotografer tidak ditemukan");
    permittedProfessional(req, person.id);
    const data = db
      .prepare(
        `SELECT s.id AS service_id, s.name, s.description, s.duration_minutes,
    s.price AS base_price, ps.price, COALESCE(ps.active, 0) AS active
    FROM services s LEFT JOIN professional_services ps ON ps.service_id = s.id AND ps.professional_id = ?
    WHERE s.tenant_id = ? AND s.active = 1 ORDER BY s.id`,
      )
      .all(person.id, req.tenantId);
    res.json({ professional_id: person.id, data });
  }),
);
app.put(
  "/api/admin/offerings/:professionalId",
  route((req, res) => {
    const professionalId = Number(req.params.professionalId);
    permittedProfessional(req, professionalId);
    if (
      !db
        .prepare("SELECT id FROM professionals WHERE id = ? AND tenant_id = ?")
        .get(professionalId, req.tenantId)
    )
      error(404, "Fotografer tidak ditemukan");
    if (
      !Array.isArray(req.body.offerings) ||
      new Set(req.body.offerings.map((item) => item.service_id)).size !==
        req.body.offerings.length
    )
      error(422, "Daftar layanan tidak valid", "offerings");
    const validService = db.prepare(
      "SELECT id FROM services WHERE id = ? AND tenant_id = ? AND active = 1",
    );
    for (const item of req.body.offerings) {
      if (
        !validService.get(item.service_id, req.tenantId) ||
        !Number.isInteger(Number(item.price)) ||
        Number(item.price) < 0
      )
        error(422, "Harga atau layanan tidak valid", "offerings");
    }
    db.transaction(() => {
      const upsert =
        db.prepare(`INSERT INTO professional_services (professional_id, service_id, price, active)
      VALUES (?, ?, ?, ?) ON CONFLICT(professional_id, service_id) DO UPDATE SET price = excluded.price, active = excluded.active`);
      for (const item of req.body.offerings)
        upsert.run(
          professionalId,
          item.service_id,
          Number(item.price),
          item.active ? 1 : 0,
        );
    })();
    res.json({ message: "Paket dan harga fotografer disimpan" });
  }),
);
app.get(
  "/api/admin/accounts",
  company,
  route((req, res) => {
    const data = db
      .prepare(
        `SELECT a.id, a.email, a.role, a.professional_id, p.name AS professional_name
    FROM admins a LEFT JOIN professionals p ON p.id = a.professional_id WHERE a.tenant_id = ? ORDER BY a.id`,
      )
      .all(req.tenantId);
    res.json({ data });
  }),
);
app.post(
  "/api/admin/accounts",
  company,
  route((req, res) => {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body.password || "");
    const professionalId = Number(req.body.professional_id);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      error(422, "Email tidak valid", "email");
    if (password.length < 8)
      error(422, "Kata sandi minimal 8 karakter", "password");
    if (
      !db
        .prepare("SELECT id FROM professionals WHERE id = ? AND tenant_id = ?")
        .get(professionalId, req.tenantId)
    )
      error(422, "Pilih fotografer", "professional_id");
    const result = db
      .prepare(
        "INSERT INTO admins (tenant_id, email, password_hash, role, professional_id) VALUES (?, ?, ?, 'photographer', ?)",
      )
      .run(req.tenantId, email, bcrypt.hashSync(password, 10), professionalId);
    res
      .status(201)
      .json({ id: result.lastInsertRowid, message: "Akun fotografer dibuat" });
  }),
);
app.patch(
  "/api/admin/password",
  route((req, res) => {
    const previous = db
      .prepare("SELECT password_hash FROM admins WHERE id = ?")
      .get(req.account.id);
    if (
      !bcrypt.compareSync(
        String(req.body.current_password || ""),
        previous.password_hash,
      )
    )
      error(422, "Kata sandi saat ini salah", "current_password");
    if (String(req.body.new_password || "").length < 8)
      error(422, "Kata sandi baru minimal 8 karakter", "new_password");
    db.prepare("UPDATE admins SET password_hash = ? WHERE id = ?").run(
      bcrypt.hashSync(req.body.new_password, 10),
      req.account.id,
    );
    res.json({ message: "Kata sandi diperbarui" });
  }),
);
app.get(
  "/api/admin/blocks",
  route((req, res) => {
    const data = db
      .prepare(
        `SELECT blocks.*, professionals.name AS professional_name FROM blocks JOIN professionals ON professionals.id = blocks.professional_id WHERE professionals.tenant_id = ? AND blocks.date >= ?${req.professionalId ? " AND professionals.id = ?" : ""} ORDER BY blocks.date, blocks.start_time`,
      )
      .all(
        ...(req.professionalId
          ? [req.tenantId, today(), req.professionalId]
          : [req.tenantId, today()]),
      );
    res.json({ data });
  }),
);
app.post(
  "/api/admin/blocks",
  route((req, res) => {
    const { professional_id, date, start_time, end_time, reason } = req.body;
    const person = db
      .prepare("SELECT id FROM professionals WHERE id = ? AND tenant_id = ?")
      .get(professional_id, req.tenantId);
    if (!person) error(404, "Fotografer tidak ditemukan");
    permittedProfessional(req, person.id);
    if (
      !validDate(date) ||
      date < today() ||
      !timePattern.test(start_time) ||
      !timePattern.test(end_time) ||
      start_time >= end_time
    )
      error(422, "Tanggal atau jam blokir tidak valid");
    if (!isAvailable(person.id, date, start_time, end_time))
      error(409, "Jadwal sudah terisi atau diblokir");
    const result = db
      .prepare(
        "INSERT INTO blocks (professional_id, date, start_time, end_time, reason) VALUES (?, ?, ?, ?, ?)",
      )
      .run(
        person.id,
        date,
        start_time,
        end_time,
        String(reason || "").slice(0, 200),
      );
    res.status(201).json({
      id: result.lastInsertRowid,
      message: "Jadwal berhasil diblokir",
    });
  }),
);
app.delete(
  "/api/admin/blocks/:id",
  route((req, res) => {
    const block = db
      .prepare("SELECT professional_id FROM blocks WHERE id = ?")
      .get(req.params.id);
    if (block) permittedProfessional(req, block.professional_id);
    const result = db
      .prepare(
        "DELETE FROM blocks WHERE id = ? AND professional_id IN (SELECT id FROM professionals WHERE tenant_id = ?)",
      )
      .run(req.params.id, req.tenantId);
    if (!result.changes) error(404, "Blokir tidak ditemukan");
    res.json({ message: "Blokir jadwal dihapus" });
  }),
);
app.use((_req, res) =>
  res.status(404).json({ message: "Endpoint tidak ditemukan" }),
);
app.use((cause, _req, res, _next) => {
  if (cause.code === "SQLITE_CONSTRAINT_UNIQUE")
    return res.status(409).json({ message: "Slug atau email sudah digunakan" });
  if (!cause.status || cause.status >= 500) console.error(cause);
  res.status(cause.status || 500).json({
    message: cause.status ? cause.message : "Terjadi kesalahan pada server",
    ...(cause.errors && { errors: cause.errors }),
  });
});

module.exports = app;
