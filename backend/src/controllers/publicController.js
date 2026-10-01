const db = require("../config/database");
const { sendProblem, sendServerError } = require("../utils/http");
const { serializeSubscriber } = require("../utils/subscriber");

function slugify(value) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 20);
}

function createAvailableSubdomain(value, productType) {
  const base = slugify(value) || productType;
  let candidate = base;
  let suffix = 2;

  while (
    db
      .prepare("SELECT 1 FROM subscribers WHERE subdomain = ? COLLATE NOCASE AND product_type = ?")
      .get(candidate, productType)
  ) {
    candidate = `${base.slice(0, Math.max(1, 19 - String(suffix).length))}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

exports.checkout = (req, res) => {
  try {
    const { name, email, whatsapp, business_name, business_type, product_type } = req.body;
    const result = db.transaction(() => {
      const existing = db.prepare(
        "SELECT status FROM subscribers WHERE email = ? COLLATE NOCASE AND product_type = ?",
      ).get(email, product_type);
      if (existing) return { existing: existing.status };

      const subdomain = createAvailableSubdomain(business_name, product_type);
      const inserted = db.prepare(`
        INSERT INTO subscribers
          (name, email, whatsapp, business_name, business_type, product_type, subdomain, plan, payment_method, amount, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'early_access', NULL, 0, 'pending')
      `).run(name, email, whatsapp, business_name, business_type, product_type, subdomain);
      return { id: inserted.lastInsertRowid };
    })();

    if (result.existing) {
      const detail = result.existing === "confirmed"
        ? "Email ini sudah terdaftar untuk aplikasi yang dipilih."
        : "Pendaftaran dengan email ini sudah ada. Hubungi tim RentalKu jika perlu bantuan.";
      return sendProblem(req, res, 409, detail, [{ field: "email", message: detail }]);
    }

    const sub = db.prepare(
      "SELECT id, name, email, whatsapp, business_name, business_type, product_type, subdomain, plan, payment_method, amount, status, created_at FROM subscribers WHERE id = ?",
    ).get(result.id);

    res.status(201).json({
      message: "Pendaftaran diterima. Tim kami akan meninjaunya terlebih dahulu.",
      data: serializeSubscriber(sub),
    });
  } catch (err) {
    return sendServerError(req, res, "public.checkout", err);
  }
};
