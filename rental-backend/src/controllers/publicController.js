const db = require("../config/database");
const { createOrder } = require("../services/orderService");
const { ApiError, sendServerError } = require("../utils/http");

exports.getProducts = (req, res) => {
  try {
    const { category_id } = req.query;
    let query = `SELECT i.id, i.name, i.description, i.category_id,
      i.rate_daily, i.rate_weekly, i.rate_monthly, i.available_stock,
      i.image_url, c.name as category_name
      FROM inventory i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.status = 'active'`;
    const params = [];

    if (category_id) {
      query += " AND i.category_id = ?";
      params.push(category_id);
    }
    query += " ORDER BY i.name";
    res.json(db.prepare(query).all(...params));
  } catch (error) {
    sendServerError(res, "public.getProducts", error);
  }
};

exports.getCategories = (req, res) => {
  try {
    res.json(db.prepare("SELECT * FROM categories ORDER BY name").all());
  } catch (error) {
    sendServerError(res, "public.getCategories", error);
  }
};

exports.getSiteConfig = (req, res) => {
  try {
    const config = db
      .prepare(
        `SELECT business_name, tagline, description, logo_url, primary_color,
          secondary_color, whatsapp, email, address, hero_title,
          hero_subtitle, about_text
         FROM site_config WHERE id = 1`,
      )
      .get() || {
      business_name: "My Rental",
      tagline: "Sewa Peralatan Terlengkap",
      primary_color: "#2f5948",
      secondary_color: "#c66e46",
    };
    res.json(config);
  } catch (error) {
    sendServerError(res, "public.getSiteConfig", error);
  }
};

exports.createBooking = (req, res) => {
  try {
    const { name, whatsapp, email, items, start_date, end_date, notes } =
      req.body;

    const order = db.transaction(() => {
      let customer = db
        .prepare("SELECT * FROM customers WHERE whatsapp = ?")
        .get(whatsapp);

      if (customer?.is_blacklisted) {
        throw new ApiError(
          403,
          "Booking tidak dapat diproses untuk kontak ini",
        );
      }
      if (!customer) {
        const result = db
          .prepare(
            "INSERT INTO customers (name, whatsapp, email) VALUES (?,?,?)",
          )
          .run(name, whatsapp, email || null);
        customer = db
          .prepare("SELECT * FROM customers WHERE id = ?")
          .get(result.lastInsertRowid);
      } else {
        db.prepare(
          "UPDATE customers SET name = ?, email = COALESCE(?, email) WHERE id = ?",
        ).run(name, email || null, customer.id);
      }

      return createOrder({
        customerId: customer.id,
        startDate: start_date,
        endDate: end_date,
        items,
        notes,
      });
    })();

    res.status(201).json({
      message: "Booking berhasil dikirim",
      data: {
        order_number: order.order_number,
        total_amount: order.total_amount,
        status: order.status,
      },
    });
  } catch (error) {
    sendServerError(res, "public.createBooking", error);
  }
};
