const db = require("../config/database");
const { sendProblem, sendServerError } = require("../utils/http");
const { serializeSubscriber } = require("../utils/subscriber");

const subscriberColumns = `id, name, email, whatsapp, business_name, business_type,
  product_type, subdomain, plan, payment_method, amount, status, confirmed_at,
  notes, created_at`;
const findSubscriber = db.prepare(`SELECT ${subscriberColumns} FROM subscribers WHERE id = ?`);

exports.getAll = (req, res) => {
  try {
    const { search, status, product_type } = req.query;
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    let filters = " WHERE 1=1";
    const params = [];

    if (search) {
      filters += " AND (name LIKE ? ESCAPE '\\' OR email LIKE ? ESCAPE '\\' OR business_name LIKE ? ESCAPE '\\')";
      const term = `%${search.replace(/[\\%_]/g, "\\$&")}%`;
      params.push(term, term, term);
    }
    if (status) {
      filters += " AND status = ?";
      params.push(status);
    }
    if (product_type) {
      filters += " AND product_type = ?";
      params.push(product_type);
    }

    const { total } = db.prepare(`SELECT COUNT(*) AS total FROM subscribers${filters}`).get(...params);

    const offset = (page - 1) * limit;
    const items = db.prepare(`
      SELECT ${subscriberColumns}
      FROM subscribers${filters} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?
    `).all(...params, limit, offset).map(serializeSubscriber);

    res.json({
      data: items,
      meta: { pagination: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) } },
    });
  } catch (err) {
    return sendServerError(req, res, "subscribers.getAll", err);
  }
};

exports.getById = (req, res) => {
  try {
    const sub = findSubscriber.get(req.params.id);
    if (!sub) return sendProblem(req, res, 404, "Pendaftar tidak ditemukan.");
    res.json({ data: serializeSubscriber(sub) });
  } catch (err) {
    return sendServerError(req, res, "subscribers.getById", err);
  }
};

exports.updateStatus = (req, res) => {
  try {
    const { status, notes } = req.body;
    const sub = findSubscriber.get(req.params.id);
    if (!sub) return sendProblem(req, res, 404, "Pendaftar tidak ditemukan.");

    const confirmedAt =
      status === "confirmed"
        ? sub.confirmed_at || new Date().toISOString()
        : null;
    db.prepare(
      "UPDATE subscribers SET status = ?, confirmed_at = ?, notes = ? WHERE id = ?",
    ).run(
      status,
      confirmedAt,
      notes !== undefined ? notes : sub.notes,
      req.params.id,
    );

    const updated = findSubscriber.get(req.params.id);
    res.json({
      message: ({ pending: "Pendaftaran siap ditinjau kembali.", confirmed: "Pendaftaran disetujui.", rejected: "Pendaftaran ditolak." })[status],
      data: serializeSubscriber(updated),
    });
  } catch (err) {
    return sendServerError(req, res, "subscribers.updateStatus", err);
  }
};

exports.delete = (req, res) => {
  try {
    const result = db.prepare("DELETE FROM subscribers WHERE id = ?").run(req.params.id);
    if (!result.changes) return sendProblem(req, res, 404, "Pendaftar tidak ditemukan.");
    res.status(204).end();
  } catch (err) {
    return sendServerError(req, res, "subscribers.delete", err);
  }
};

exports.getStats = (req, res) => {
  try {
    const { totalSubscribers, confirmed, pending, rejected } = db.prepare(`
      SELECT COUNT(*) AS totalSubscribers,
        COALESCE(SUM(status = 'confirmed'), 0) AS confirmed,
        COALESCE(SUM(status = 'pending'), 0) AS pending,
        COALESCE(SUM(status = 'rejected'), 0) AS rejected
      FROM subscribers
    `).get();
    const recentSubscribers = db
      .prepare(
        `
      SELECT id, name, email, business_name, product_type, plan, payment_method, amount, status, created_at
      FROM subscribers ORDER BY created_at DESC, id DESC LIMIT 5
    `,
      )
      .all().map(serializeSubscriber);

    const byProduct = Object.fromEntries(
      ["rental", "booking"].map((type) => [
        type,
        db.prepare("SELECT COUNT(*) AS total, COALESCE(SUM(status = 'pending'), 0) AS pending, COALESCE(SUM(status = 'confirmed'), 0) AS confirmed FROM subscribers WHERE product_type = ?").get(type),
      ]),
    );

    res.json({ data: {
      totalSubscribers,
      confirmed,
      pending,
      rejected,
      recentSubscribers,
      byProduct,
    } });
  } catch (err) {
    return sendServerError(req, res, "subscribers.getStats", err);
  }
};
