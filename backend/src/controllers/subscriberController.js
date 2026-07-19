const db = require("../config/database");

exports.getAll = (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    let query = `SELECT id, name, email, whatsapp, business_name, business_type, subdomain, plan, payment_method, amount, status, confirmed_at, notes, created_at FROM subscribers WHERE 1=1`;
    const params = [];

    if (search) {
      query += ` AND (name LIKE ? OR email LIKE ? OR business_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) {
      query += ` AND status = ?`;
      params.push(status);
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
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getById = (req, res) => {
  try {
    const sub = db
      .prepare(
        "SELECT id, name, email, whatsapp, business_name, business_type, subdomain, plan, payment_method, amount, status, confirmed_at, notes, created_at FROM subscribers WHERE id = ?",
      )
      .get(req.params.id);
    if (!sub)
      return res.status(404).json({ message: "Subscriber tidak ditemukan" });
    res.json(sub);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateStatus = (req, res) => {
  try {
    const { status, notes } = req.body;
    if (!["pending", "confirmed", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status tidak valid" });
    }
    const sub = db
      .prepare("SELECT * FROM subscribers WHERE id = ?")
      .get(req.params.id);
    if (!sub)
      return res.status(404).json({ message: "Subscriber tidak ditemukan" });

    const confirmedAt =
      status === "confirmed" ? new Date().toISOString() : sub.confirmed_at;
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
    res.status(500).json({ message: "Server error", error: err.message });
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
    res.status(500).json({ message: "Server error", error: err.message });
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
      SELECT id, name, email, business_name, plan, payment_method, amount, status, created_at
      FROM subscribers ORDER BY created_at DESC LIMIT 5
    `,
      )
      .all();

    res.json({
      totalSubscribers,
      confirmed,
      pending,
      rejected,
      totalRevenue,
      recentSubscribers,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
