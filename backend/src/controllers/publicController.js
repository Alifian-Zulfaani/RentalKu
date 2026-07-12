const bcrypt = require('bcryptjs');
const db = require('../config/database');

exports.checkout = (req, res) => {
  try {
    const { name, email, whatsapp, password, business_name, business_type, plan, payment_method } = req.body;

    if (!name || !email || !whatsapp || !password) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    const existing = db.prepare("SELECT * FROM subscribers WHERE email = ? AND status = 'confirmed'").get(email);
    if (existing) {
      return res.status(400).json({ message: 'Email ini sudah terdaftar sebagai subscriber aktif' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const amount = 249000;
    const subdomain = (business_name || name).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);

    const result = db.prepare(`
      INSERT INTO subscribers (name, email, whatsapp, password, business_name, business_type, subdomain, plan, payment_method, amount, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `).run(name, email, whatsapp, hashedPassword, business_name || null, business_type || null, subdomain, plan || 'lifetime', payment_method || 'transfer', amount);

    const sub = db.prepare('SELECT id, name, email, whatsapp, business_name, subdomain, plan, payment_method, amount, status, created_at FROM subscribers WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      message: 'Pendaftaran berhasil! Silakan lakukan pembayaran.',
      data: sub
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
