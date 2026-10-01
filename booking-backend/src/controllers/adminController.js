const express = require("express");
const db = require("../config/database");
const { apiError: error, asyncHandler: route } = require("../utils/http");
const {
  offeringFor,
  professionalFor,
  serviceFor,
  tenantBySlug,
} = require("../services/bookingService");
const {
  validDate,
  timePattern,
  toMinutes,
  toTime,
  today,
  slotsForDay,
  isAvailable,
} = require("../services/schedulingService");
const bcrypt = require("bcryptjs");
const {
  companyOnly: company,
  assertProfessionalAccess: permittedProfessional,
} = require("../middleware/auth");
const router = express.Router();

router.get(
  "/me",
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
        .prepare(
          "SELECT id, slug, name, whatsapp, email FROM tenants WHERE id = ?",
        )
        .get(req.tenantId),
    });
  }),
);
router.get(
  "/overview",
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
router.get(
  "/bookings",
  route((req, res) => {
    const page = Math.max(1, Math.trunc(Number(req.query.page)) || 1);
    const limit = 10;
    const status = ["pending", "confirmed", "completed", "cancelled"].includes(
      req.query.status,
    )
      ? req.query.status
      : null;
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim().slice(0, 100)
        : "";
    const where =
      "WHERE b.tenant_id = ?" +
      (req.professionalId ? " AND b.professional_id = ?" : "") +
      (status ? " AND b.status = ?" : "") +
      (search
        ? " AND (b.customer_name LIKE ? OR b.customer_email LIKE ? OR b.customer_whatsapp LIKE ? OR p.name LIKE ? OR s.name LIKE ?)"
        : "");
    const args = [
      req.tenantId,
      ...(req.professionalId ? [req.professionalId] : []),
      ...(status ? [status] : []),
      ...(search ? Array(5).fill(`%${search}%`) : []),
    ];
    const total = db
      .prepare(
        `SELECT COUNT(*) AS count FROM bookings b JOIN professionals p ON p.id = b.professional_id JOIN services s ON s.id = b.service_id ${where}`,
      )
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
router.patch(
  "/bookings/:id/status",
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
router.get(
  "/professionals",
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
router.put(
  "/professionals/:id/schedule",
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
router.get(
  "/services",
  company,
  route((req, res) =>
    res.json({
      data: db
        .prepare("SELECT * FROM services WHERE tenant_id = ? ORDER BY id")
        .all(req.tenantId),
    }),
  ),
);
router.get(
  "/site",
  route((req, res) =>
    res.json(
      db.prepare("SELECT * FROM tenants WHERE id = ?").get(req.tenantId),
    ),
  ),
);
router.patch(
  "/site",
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
router.post(
  "/professionals",
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
router.patch(
  "/professionals/:id",
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
router.post(
  "/services",
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
router.patch(
  "/services/:id",
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
router.get(
  "/offerings",
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
router.put(
  "/offerings/:professionalId",
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
router.get(
  "/accounts",
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
router.post(
  "/accounts",
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
router.patch(
  "/password",
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
router.get(
  "/blocks",
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
router.post(
  "/blocks",
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
router.delete(
  "/blocks/:id",
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

module.exports = router;
