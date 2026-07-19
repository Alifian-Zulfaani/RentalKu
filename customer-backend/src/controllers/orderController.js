const db = require("../config/database");

exports.getAll = (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    let q = `SELECT o.*, c.name as customer_name, c.whatsapp as customer_whatsapp FROM orders o LEFT JOIN customers c ON o.customer_id = c.id WHERE 1=1`;
    const p = [];
    if (search) {
      q += ` AND (o.order_number LIKE ? OR c.name LIKE ?)`;
      p.push(`%${search}%`, `%${search}%`);
    }
    if (status) {
      q += ` AND o.status = ?`;
      p.push(status);
    }

    const countQ =
      `SELECT COUNT(*) as total FROM orders o LEFT JOIN customers c ON o.customer_id = c.id WHERE 1=1` +
      (search
        ? ` AND (o.order_number LIKE '${search}' OR c.name LIKE '${search}')`
        : "") +
      (status ? ` AND o.status = '${status}'` : "");
    const { total } = db.prepare(countQ).get();
    const offset = (page - 1) * limit;
    q += ` ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
    p.push(Number(limit), offset);

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
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

exports.getById = (req, res) => {
  try {
    const o = db
      .prepare(
        "SELECT o.*, c.name as customer_name, c.whatsapp as customer_whatsapp FROM orders o LEFT JOIN customers c ON o.customer_id = c.id WHERE o.id = ?",
      )
      .get(req.params.id);
    if (!o) return res.status(404).json({ message: "Order tidak ditemukan" });
    o.items = db
      .prepare(
        "SELECT oi.*, i.name as item_name FROM order_items oi LEFT JOIN inventory i ON oi.inventory_id = i.id WHERE oi.order_id = ?",
      )
      .all(req.params.id);
    res.json(o);
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

exports.create = (req, res) => {
  try {
    const { customer_id, start_date, end_date, items, notes } = req.body;
    if (!customer_id || !items?.length)
      return res
        .status(400)
        .json({ message: "Customer dan barang wajib diisi" });

    const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Date.now()).slice(-4)}`;
    let totalAmount = 0;

    const insert = db.transaction(() => {
      const result = db
        .prepare(
          "INSERT INTO orders (order_number, customer_id, start_date, end_date, notes) VALUES (?,?,?,?,?)",
        )
        .run(
          orderNumber,
          customer_id,
          start_date || null,
          end_date || null,
          notes || null,
        );
      const orderId = result.lastInsertRowid;

      for (const item of items) {
        const inv = db
          .prepare("SELECT * FROM inventory WHERE id = ?")
          .get(item.inventory_id);
        if (!inv) continue;
        if (inv.available_stock < (item.quantity || 1)) continue;
        const rateType = item.rate_type || "daily";
        const rateAmount =
          rateType === "daily"
            ? inv.rate_daily
            : rateType === "weekly"
              ? inv.rate_weekly
              : inv.rate_monthly;
        const subtotal = rateAmount * (item.quantity || 1);
        totalAmount += subtotal;
        db.prepare(
          "INSERT INTO order_items (order_id, inventory_id, quantity, rate_type, rate_amount, subtotal) VALUES (?,?,?,?,?,?)",
        ).run(
          orderId,
          item.inventory_id,
          item.quantity || 1,
          rateType,
          rateAmount,
          subtotal,
        );
        db.prepare(
          "UPDATE inventory SET available_stock = available_stock - ? WHERE id = ?",
        ).run(item.quantity || 1, item.inventory_id);
      }

      db.prepare("UPDATE orders SET total_amount = ? WHERE id = ?").run(
        totalAmount,
        orderId,
      );
      return orderId;
    });

    const orderId = insert();
    res
      .status(201)
      .json(db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId));
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

exports.updateStatus = (req, res) => {
  try {
    const { status } = req.body;
    if (
      !["booking", "active", "late", "completed", "cancelled"].includes(status)
    )
      return res.status(400).json({ message: "Status tidak valid" });
    const o = db
      .prepare("SELECT * FROM orders WHERE id = ?")
      .get(req.params.id);
    if (!o) return res.status(404).json({ message: "Order tidak ditemukan" });

    if (
      (status === "completed" || status === "cancelled") &&
      !["completed", "cancelled"].includes(o.status)
    ) {
      const items = db
        .prepare("SELECT * FROM order_items WHERE order_id = ?")
        .all(o.id);
      for (const item of items) {
        db.prepare(
          "UPDATE inventory SET available_stock = available_stock + ? WHERE id = ?",
        ).run(item.quantity, item.inventory_id);
      }
    }

    db.prepare(
      "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    ).run(status, req.params.id);
    res.json({ message: `Status berhasil diubah ke ${status}` });
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

exports.getStats = (req, res) => {
  try {
    const totalOrders = db
      .prepare("SELECT COUNT(*) as count FROM orders")
      .get().count;
    const activeOrders = db
      .prepare(
        "SELECT COUNT(*) as count FROM orders WHERE status IN ('booking','active')",
      )
      .get().count;
    const totalCustomers = db
      .prepare("SELECT COUNT(*) as count FROM customers")
      .get().count;
    const totalInventory = db
      .prepare("SELECT COUNT(*) as count FROM inventory")
      .get().count;
    const totalRevenue = db
      .prepare(
        "SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status IN ('active','completed')",
      )
      .get().total;
    const lateOrders = db
      .prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'late'")
      .get().count;
    const recentOrders = db
      .prepare(
        `SELECT o.*, c.name as customer_name FROM orders o LEFT JOIN customers c ON o.customer_id = c.id ORDER BY o.created_at DESC LIMIT 5`,
      )
      .all();
    res.json({
      totalOrders,
      activeOrders,
      totalCustomers,
      totalInventory,
      totalRevenue,
      lateOrders,
      recentOrders,
    });
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};
