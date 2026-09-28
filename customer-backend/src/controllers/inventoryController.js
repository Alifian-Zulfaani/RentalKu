const db = require("../config/database");
const { ApiError, getPagination, sendServerError } = require("../utils/http");

exports.getCategories = (req, res) => {
  try {
    res.json(db.prepare("SELECT * FROM categories ORDER BY name").all());
  } catch (e) {
    sendServerError(res, "inventory.getCategories", e);
  }
};

exports.getAll = (req, res) => {
  try {
    const { search, status, category_id } = req.query;
    const { page, limit, offset } = getPagination(req.query);
    let q = `SELECT i.*, c.name as category_name FROM inventory i LEFT JOIN categories c ON i.category_id = c.id WHERE 1=1`;
    const p = [];
    if (search) {
      q += ` AND i.name LIKE ?`;
      p.push(`%${search}%`);
    }
    if (status) {
      q += ` AND i.status = ?`;
      p.push(status);
    }
    if (category_id) {
      q += ` AND i.category_id = ?`;
      p.push(category_id);
    }

    const countQ = q.replace(
      /SELECT .+? FROM/,
      "SELECT COUNT(*) as total FROM",
    );
    const { total } = db.prepare(countQ).get(...p);
    q += ` ORDER BY i.created_at DESC LIMIT ? OFFSET ?`;
    p.push(limit, offset);

    res.json({
      data: db.prepare(q).all(...p),
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (e) {
    sendServerError(res, "inventory.getAll", e);
  }
};

exports.getById = (req, res) => {
  try {
    const item = db
      .prepare(
        "SELECT i.*, c.name as category_name FROM inventory i LEFT JOIN categories c ON i.category_id = c.id WHERE i.id = ?",
      )
      .get(req.params.id);
    if (!item)
      return res.status(404).json({ message: "Barang tidak ditemukan" });
    res.json(item);
  } catch (e) {
    sendServerError(res, "inventory.getById", e);
  }
};

exports.create = (req, res) => {
  try {
    const {
      name,
      category_id,
      stock,
      rate_daily,
      rate_weekly,
      rate_monthly,
      status,
      image_url,
      description,
    } = req.body;
    const result = db
      .prepare(
        `INSERT INTO inventory (name, category_id, stock, available_stock, rate_daily, rate_weekly, rate_monthly, status, image_url, description) VALUES (?,?,?,?,?,?,?,?,?,?)`,
      )
      .run(
        name,
        category_id ? Number(category_id) : null,
        stock ?? 0,
        stock ?? 0,
        rate_daily ?? 0,
        rate_weekly ?? 0,
        rate_monthly ?? 0,
        status ?? "active",
        image_url ?? null,
        description ?? null,
      );
    res
      .status(201)
      .json(
        db
          .prepare("SELECT * FROM inventory WHERE id = ?")
          .get(result.lastInsertRowid),
      );
  } catch (e) {
    sendServerError(res, "inventory.create", e);
  }
};

exports.update = (req, res) => {
  try {
    const item = db
      .prepare("SELECT * FROM inventory WHERE id = ?")
      .get(req.params.id);
    if (!item)
      return res.status(404).json({ message: "Barang tidak ditemukan" });
    const {
      name,
      category_id,
      stock,
      rate_daily,
      rate_weekly,
      rate_monthly,
      status,
      image_url,
      description,
    } = req.body;
    const rentedQty = item.stock - item.available_stock;
    const nextStock = stock ?? item.stock;
    if (nextStock < rentedQty) {
      throw new ApiError(
        409,
        `Stok tidak dapat lebih kecil dari ${rentedQty} unit yang sedang dipesan`,
      );
    }
    const newAvail = nextStock - rentedQty;
    db.prepare(
      `UPDATE inventory SET name=?, category_id=?, stock=?, available_stock=?, rate_daily=?, rate_weekly=?, rate_monthly=?, status=?, image_url=?, description=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    ).run(
      name ?? item.name,
      category_id === "" || category_id === null
        ? null
        : category_id !== undefined
          ? category_id
          : item.category_id,
      nextStock,
      newAvail,
      rate_daily !== undefined ? rate_daily : item.rate_daily,
      rate_weekly !== undefined ? rate_weekly : item.rate_weekly,
      rate_monthly !== undefined ? rate_monthly : item.rate_monthly,
      status ?? item.status,
      image_url !== undefined ? image_url : item.image_url,
      description !== undefined ? description : item.description,
      req.params.id,
    );
    res.json(
      db.prepare("SELECT * FROM inventory WHERE id = ?").get(req.params.id),
    );
  } catch (e) {
    sendServerError(res, "inventory.update", e);
  }
};

exports.delete = (req, res) => {
  try {
    const item = db
      .prepare("SELECT * FROM inventory WHERE id = ?")
      .get(req.params.id);
    if (!item)
      return res.status(404).json({ message: "Barang tidak ditemukan" });
    const reserved = db
      .prepare(
        `SELECT COUNT(*) as total
         FROM order_items oi
         JOIN orders o ON o.id = oi.order_id
         WHERE oi.inventory_id = ? AND o.status NOT IN ('completed', 'cancelled')`,
      )
      .get(req.params.id).total;
    if (reserved) {
      throw new ApiError(
        409,
        "Barang masih terhubung ke order berjalan dan belum dapat dihapus",
      );
    }
    db.prepare("DELETE FROM inventory WHERE id = ?").run(req.params.id);
    res.json({ message: "Barang berhasil dihapus" });
  } catch (e) {
    sendServerError(res, "inventory.delete", e);
  }
};
