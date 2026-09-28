const db = require("../config/database");
const {
  TERMINAL_STATUSES,
  createOrder,
  restoreOrderStock,
} = require("../services/orderService");
const { ApiError, getPagination, sendServerError } = require("../utils/http");

exports.getAll = (req, res) => {
  try {
    const { search, status } = req.query;
    const { page, limit, offset } = getPagination(req.query);
    let where = " WHERE 1=1";
    const params = [];

    if (search) {
      where += " AND (o.order_number LIKE ? OR c.name LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    if (status) {
      where += " AND o.status = ?";
      params.push(status);
    }

    const { total } = db
      .prepare(
        `SELECT COUNT(*) as total FROM orders o LEFT JOIN customers c ON o.customer_id = c.id${where}`,
      )
      .get(...params);
    const data = db
      .prepare(
        `SELECT o.*, c.name as customer_name, c.whatsapp as customer_whatsapp,
          c.email as customer_email, c.address as customer_address
         FROM orders o
         LEFT JOIN customers c ON o.customer_id = c.id
         ${where}
         ORDER BY o.created_at DESC
         LIMIT ? OFFSET ?`,
      )
      .all(...params, limit, offset);

    res.json({
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    sendServerError(res, "orders.getAll", error);
  }
};

exports.getById = (req, res) => {
  try {
    const order = db
      .prepare(
        `SELECT o.*, c.name as customer_name, c.whatsapp as customer_whatsapp,
          c.email as customer_email, c.address as customer_address
         FROM orders o
         LEFT JOIN customers c ON o.customer_id = c.id
         WHERE o.id = ?`,
      )
      .get(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order tidak ditemukan" });
    }
    order.items = db
      .prepare(
        `SELECT oi.*, i.name as item_name
         FROM order_items oi
         LEFT JOIN inventory i ON oi.inventory_id = i.id
         WHERE oi.order_id = ?`,
      )
      .all(req.params.id);
    res.json(order);
  } catch (error) {
    sendServerError(res, "orders.getById", error);
  }
};

exports.create = (req, res) => {
  try {
    const { customer_id, start_date, end_date, items, notes } = req.body;
    const order = createOrder({
      customerId: customer_id,
      startDate: start_date,
      endDate: end_date,
      items,
      notes,
      allowRateType: true,
    });
    res.status(201).json(order);
  } catch (error) {
    sendServerError(res, "orders.create", error);
  }
};

exports.updateStatus = (req, res) => {
  try {
    const { status } = req.body;
    const order = db
      .prepare("SELECT id, status FROM orders WHERE id = ?")
      .get(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order tidak ditemukan" });
    }
    if (order.status === status) {
      return res.json({ message: `Status order tetap ${status}` });
    }

    const allowedTransitions = {
      booking: ["active", "cancelled"],
      active: ["late", "completed", "cancelled"],
      late: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
    };
    if (!allowedTransitions[order.status]?.includes(status)) {
      throw new ApiError(
        409,
        `Status tidak dapat diubah dari ${order.status} ke ${status}`,
      );
    }

    db.transaction(() => {
      if (TERMINAL_STATUSES.includes(status)) restoreOrderStock(order.id);
      db.prepare(
        "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      ).run(status, order.id);
    })();

    res.json({ message: `Status berhasil diubah ke ${status}` });
  } catch (error) {
    sendServerError(res, "orders.updateStatus", error);
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
        "SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status = 'completed'",
      )
      .get().total;
    const lateOrders = db
      .prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'late'")
      .get().count;
    const recentOrders = db
      .prepare(
        `SELECT o.*, c.name as customer_name
         FROM orders o
         LEFT JOIN customers c ON o.customer_id = c.id
         ORDER BY o.created_at DESC
         LIMIT 5`,
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
  } catch (error) {
    sendServerError(res, "orders.getStats", error);
  }
};
