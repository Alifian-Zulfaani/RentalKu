const db = require("../config/database");
const { logServerError } = require("../utils/http");

exports.getAll = (req, res) => {
  try {
    const { search, status, product_type } = req.query;
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    let query = `SELECT id, name, email, whatsapp, business_name, business_type, product_type, subdomain, plan, payment_method, amount, status, confirmed_at, notes, created_at FROM subscribers WHERE 1=1`;
    const params = [];

    if (search) {
      query += ` AND (name LIKE ? OR email LIKE ? OR business_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }
    if (product_type) {
      query += ` AND product_type = ?`;
      params.push(product_type);
    }

    const countQuery = query.replace(
      /SELECT .+? FROM/,
      "SELECT COUNT(*) as total FROM",
    );
    const { total } = db.prepare(countQuery).get(...params);

    const offset = (page - 1) * limit;
    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), offset);

    const items = db.prepare(query).all(...params);

    res.json({
      data: items,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    logServerError("subscribers.getAll", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

exports.getById = (req, res) => {
  try {
    const sub = db
      .prepare(
        "SELECT id, name, email, whatsapp, business_name, business_type, product_type, subdomain, plan, payment_method, amount, status, confirmed_at, notes, created_at FROM subscribers WHERE id = ?",
      )
      .get(req.params.id);
    if (!sub)
      return res.status(404).json({ message: "Subscriber tidak ditemukan" });
    res.json(sub);
  } catch (err) {
    logServerError("subscribers.getById", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

exports.updateStatus = (req, res) => {
  try {
    const { status, notes } = req.body;
    const sub = db
      .prepare("SELECT * FROM subscribers WHERE id = ?")
      .get(req.params.id);
    if (!sub)
      return res.status(404).json({ message: "Subscriber tidak ditemukan" });

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

    res.json({ message: `Subscriber berhasil di-${status}` });
  } catch (err) {
    logServerError("subscribers.updateStatus", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

exports.delete = (req, res) => {
  try {
    const sub = db
      .prepare("SELECT * FROM subscribers WHERE id = ?")
      .get(req.params.id);
    if (!sub)
      return res.status(404).json({ message: "Subscriber tidak ditemukan" });
    db.prepare("DELETE FROM subscribers WHERE id = ?").run(req.params.id);
    res.json({ message: "Subscriber berhasil dihapus" });
  } catch (err) {
    logServerError("subscribers.delete", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

exports.getStats = (req, res) => {
  try {
    const totalSubscribers = db
      .prepare("SELECT COUNT(*) as count FROM subscribers")
      .get().count;
    const confirmed = db
      .prepare(
        "SELECT COUNT(*) as count FROM subscribers WHERE status = 'confirmed'",
      )
      .get().count;
    const pending = db
      .prepare(
        "SELECT COUNT(*) as count FROM subscribers WHERE status = 'pending'",
      )
      .get().count;
    const rejected = db
      .prepare(
        "SELECT COUNT(*) as count FROM subscribers WHERE status = 'rejected'",
      )
      .get().count;
    const totalRevenue = db
      .prepare(
        "SELECT COALESCE(SUM(amount), 0) as total FROM subscribers WHERE status = 'confirmed'",
      )
      .get().total;

    const recentSubscribers = db
      .prepare(
        `
      SELECT id, name, email, business_name, product_type, plan, payment_method, amount, status, created_at
      FROM subscribers ORDER BY created_at DESC LIMIT 5
    `,
      )
      .all();

    const byProduct = Object.fromEntries(
      ["rental", "booking"].map((type) => [
        type,
        db.prepare("SELECT COUNT(*) AS total, SUM(status = 'pending') AS pending, SUM(status = 'confirmed') AS confirmed FROM subscribers WHERE product_type = ?").get(type),
      ]),
    );

    res.json({
      totalSubscribers,
      confirmed,
      pending,
      rejected,
      totalRevenue,
      recentSubscribers,
      byProduct,
    });
  } catch (err) {
    logServerError("subscribers.getStats", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};
