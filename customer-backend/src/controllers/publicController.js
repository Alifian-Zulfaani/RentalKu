const db = require('../config/database');

exports.getProducts = (req, res) => {
  try {
    const { category_id } = req.query;
    let q = `SELECT i.id, i.name, i.description, i.rate_daily, i.rate_weekly, i.rate_monthly, i.available_stock, i.image_url, c.name as category_name FROM inventory i LEFT JOIN categories c ON i.category_id = c.id WHERE i.status = 'active'`;
    const p = [];
    if (category_id) { q += ` AND i.category_id = ?`; p.push(category_id); }
    q += ` ORDER BY i.name`;
    res.json(db.prepare(q).all(...p));
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
};

exports.getCategories = (req, res) => {
  try { res.json(db.prepare('SELECT * FROM categories ORDER BY name').all()); }
  catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
};

exports.getSiteConfig = (req, res) => {
  try {
    let config = db.prepare('SELECT business_name, tagline, description, logo_url, primary_color, secondary_color, whatsapp, email, address, hero_title, hero_subtitle, about_text FROM site_config WHERE id = 1').get();
    if (!config) config = { business_name: 'My Rental', tagline: 'Sewa Peralatan Terlengkap' };
    res.json(config);
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
};

exports.createBooking = (req, res) => {
  try {
    const { name, whatsapp, email, items, start_date, end_date, notes } = req.body;
    if (!name || !whatsapp || !items?.length) return res.status(400).json({ message: 'Nama, WhatsApp, dan barang wajib diisi' });

    // Create or find customer
    let customer = db.prepare('SELECT * FROM customers WHERE whatsapp = ?').get(whatsapp);
    if (!customer) {
      const result = db.prepare('INSERT INTO customers (name, whatsapp, email) VALUES (?,?,?)').run(name, whatsapp, email || null);
      customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);
    }

    const orderNumber = `ORD-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(Date.now()).slice(-4)}`;
    let totalAmount = 0;

    const insert = db.transaction(() => {
      const result = db.prepare('INSERT INTO orders (order_number, customer_id, start_date, end_date, notes, status) VALUES (?,?,?,?,?,?)')
        .run(orderNumber, customer.id, start_date || null, end_date || null, notes || null, 'booking');
      const orderId = result.lastInsertRowid;

      for (const item of items) {
        const inv = db.prepare('SELECT * FROM inventory WHERE id = ? AND status = ?').get(item.inventory_id, 'active');
        if (!inv || inv.available_stock < (item.quantity || 1)) continue;
        const rateAmount = inv.rate_daily;
        const subtotal = rateAmount * (item.quantity || 1);
        totalAmount += subtotal;
        db.prepare('INSERT INTO order_items (order_id, inventory_id, quantity, rate_type, rate_amount, subtotal) VALUES (?,?,?,?,?,?)').run(orderId, item.inventory_id, item.quantity || 1, 'daily', rateAmount, subtotal);
        db.prepare('UPDATE inventory SET available_stock = available_stock - ? WHERE id = ?').run(item.quantity || 1, item.inventory_id);
      }

      db.prepare('UPDATE orders SET total_amount = ? WHERE id = ?').run(totalAmount, orderId);
      return orderId;
    });

    const orderId = insert();
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    res.status(201).json({ message: 'Booking berhasil!', order });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
};
