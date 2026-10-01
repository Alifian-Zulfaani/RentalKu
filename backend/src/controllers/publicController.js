const db = require("../config/database");
const { logServerError } = require("../utils/http");

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 20);
}

function createAvailableSubdomain(value, productType) {
  const base = slugify(value) || "rental";
  let candidate = base;
  let suffix = 2;

  while (
    db
      .prepare("SELECT 1 FROM subscribers WHERE subdomain = ? COLLATE NOCASE AND product_type = ?")
      .get(candidate, productType)
  ) {
    candidate = `${base.slice(0, 17)}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

exports.checkout = (req, res) => {
  try {
    const {
      name,
      email,
      whatsapp,
      business_name,
      business_type,
      product_type,
      plan,
      payment_method,
    } = req.body;

    const existing = db
      .prepare(
        "SELECT id, status FROM subscribers WHERE email = ? COLLATE NOCASE AND product_type = ?",
      )
      .get(email, product_type);
    if (existing) {
      return res.status(409).json({
        message:
          existing.status === "confirmed"
            ? "Email ini sudah terdaftar sebagai subscriber aktif"
            : "Pendaftaran dengan email ini sedang diproses",
      });
    }

    const amount = 0;
    const subdomain = createAvailableSubdomain(business_name || name, product_type);

    const result = db
      .prepare(
        `
      INSERT INTO subscribers (name, email, whatsapp, business_name, business_type, product_type, subdomain, plan, payment_method, amount, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `,
      )
      .run(
        name,
        email,
        whatsapp,
        business_name || null,
        business_type || null,
        product_type,
        subdomain,
        plan || "lifetime",
        payment_method || "free",
        amount,
      );

    const sub = db
      .prepare(
        "SELECT id, name, email, whatsapp, business_name, business_type, product_type, subdomain, plan, payment_method, amount, status, created_at FROM subscribers WHERE id = ?",
      )
      .get(result.lastInsertRowid);

    res.status(201).json({
      message: "Pendaftaran berhasil dan sedang menunggu review.",
      data: sub,
    });
  } catch (err) {
    logServerError("public.checkout", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};
