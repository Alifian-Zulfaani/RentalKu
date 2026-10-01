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
const router = express.Router();

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

router.get(
  "/site",
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
router.get(
  "/availability",
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
router.post(
  "/bookings",
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
      return {
        ...db
          .prepare(
            "SELECT id, customer_name, date, start_time, end_time, total, status FROM bookings WHERE id = ?",
          )
          .get(result.lastInsertRowid),
        service_name: service.name,
        professional_name: professional.name,
      };
    })();
    res.status(201).json({
      message: "Reservasi diterima dan menunggu konfirmasi.",
      data: booking,
    });
  }),
);

module.exports = router;
