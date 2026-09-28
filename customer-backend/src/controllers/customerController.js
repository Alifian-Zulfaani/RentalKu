const db = require("../config/database");
const { getPagination, sendServerError } = require("../utils/http");

exports.getAll = (req, res) => {
  try {
    const { search, is_blacklisted } = req.query;
    const { page, limit, offset } = getPagination(req.query);
    let where = " WHERE 1=1";
    const p = [];
    if (search) {
      where += " AND (c.name LIKE ? OR c.email LIKE ? OR c.whatsapp LIKE ?)";
      p.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (is_blacklisted !== undefined && is_blacklisted !== "") {
      where += " AND c.is_blacklisted = ?";
      p.push(Number(is_blacklisted));
    }
    const { total } = db
      .prepare(`SELECT COUNT(*) as total FROM customers c${where}`)
      .get(...p);
    const q = `SELECT c.*, (SELECT COUNT(*) FROM orders WHERE customer_id = c.id) as total_orders FROM customers c${where} ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;

    res.json({
      data: db.prepare(q).all(...p, limit, offset),
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (e) {
    sendServerError(res, "customers.getAll", e);
  }
};

exports.getById = (req, res) => {
  try {
    const c = db
      .prepare("SELECT * FROM customers WHERE id = ?")
      .get(req.params.id);
    if (!c)
      return res.status(404).json({ message: "Customer tidak ditemukan" });
    c.orders = db
      .prepare(
        "SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC",
      )
      .all(req.params.id);
    res.json(c);
  } catch (e) {
    sendServerError(res, "customers.getById", e);
  }
};

exports.create = (req, res) => {
  try {
    const { name, email, whatsapp, address, notes } = req.body;
    const result = db
      .prepare(
        "INSERT INTO customers (name, email, whatsapp, address, notes) VALUES (?,?,?,?,?)",
      )
      .run(
        name,
        email || null,
        whatsapp || null,
        address || null,
        notes || null,
      );
    res
      .status(201)
      .json(
        db
          .prepare("SELECT * FROM customers WHERE id = ?")
          .get(result.lastInsertRowid),
      );
  } catch (e) {
    sendServerError(res, "customers.create", e);
  }
};

exports.update = (req, res) => {
  try {
    const c = db
      .prepare("SELECT * FROM customers WHERE id = ?")
      .get(req.params.id);
    if (!c)
      return res.status(404).json({ message: "Customer tidak ditemukan" });
    const { name, email, whatsapp, address, notes } = req.body;
    db.prepare(
      "UPDATE customers SET name=?, email=?, whatsapp=?, address=?, notes=? WHERE id=?",
    ).run(
      name ?? c.name,
      email !== undefined ? email : c.email,
      whatsapp !== undefined ? whatsapp : c.whatsapp,
      address !== undefined ? address : c.address,
      notes !== undefined ? notes : c.notes,
      req.params.id,
    );
    res.json(
      db.prepare("SELECT * FROM customers WHERE id = ?").get(req.params.id),
    );
  } catch (e) {
    sendServerError(res, "customers.update", e);
  }
};

exports.delete = (req, res) => {
  try {
    if (!db.prepare("SELECT * FROM customers WHERE id = ?").get(req.params.id))
      return res.status(404).json({ message: "Customer tidak ditemukan" });
    db.prepare("DELETE FROM customers WHERE id = ?").run(req.params.id);
    res.json({ message: "Customer berhasil dihapus" });
  } catch (e) {
    sendServerError(res, "customers.delete", e);
  }
};

exports.toggleBlacklist = (req, res) => {
  try {
    const c = db
      .prepare("SELECT * FROM customers WHERE id = ?")
      .get(req.params.id);
    if (!c)
      return res.status(404).json({ message: "Customer tidak ditemukan" });
    db.prepare("UPDATE customers SET is_blacklisted = ? WHERE id = ?").run(
      c.is_blacklisted ? 0 : 1,
      req.params.id,
    );
    res.json({
      message: c.is_blacklisted
        ? "Customer di-unblock"
        : "Customer di-blacklist",
    });
  } catch (e) {
    sendServerError(res, "customers.toggleBlacklist", e);
  }
};
