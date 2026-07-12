const db = require('../config/database');

exports.getAll = (req, res) => {
  try {
    const { search, is_blacklisted, page = 1, limit = 10 } = req.query;
    let q = `SELECT c.*, (SELECT COUNT(*) FROM orders WHERE customer_id = c.id) as total_orders FROM customers c WHERE 1=1`;
    const p = [];
    if (search) { q += ` AND (c.name LIKE ? OR c.email LIKE ? OR c.whatsapp LIKE ?)`; p.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    if (is_blacklisted !== undefined && is_blacklisted !== '') { q += ` AND c.is_blacklisted = ?`; p.push(Number(is_blacklisted)); }

    const countQ = q.replace(/SELECT .+? FROM/, 'SELECT COUNT(*) as total FROM').replace(/ FROM customers c/, ' FROM customers c');
    const total = db.prepare(countQ.split('FROM customers')[0] + 'FROM customers c' + countQ.split('FROM customers c')[1]).get(...p)?.total || 0;
    const offset = (page - 1) * limit;
    q += ` ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
    p.push(Number(limit), offset);

    res.json({ data: db.prepare(q).all(...p), pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) } });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
};

exports.getById = (req, res) => {
  try {
    const c = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    if (!c) return res.status(404).json({ message: 'Customer tidak ditemukan' });
    c.orders = db.prepare('SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC').all(req.params.id);
    res.json(c);
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
};

exports.create = (req, res) => {
  try {
    const { name, email, whatsapp, address, notes } = req.body;
    if (!name) return res.status(400).json({ message: 'Nama wajib diisi' });
    const result = db.prepare('INSERT INTO customers (name, email, whatsapp, address, notes) VALUES (?,?,?,?,?)').run(name, email || null, whatsapp || null, address || null, notes || null);
    res.status(201).json(db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid));
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
};

exports.update = (req, res) => {
  try {
    const c = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    if (!c) return res.status(404).json({ message: 'Customer tidak ditemukan' });
    const { name, email, whatsapp, address, notes } = req.body;
    db.prepare('UPDATE customers SET name=?, email=?, whatsapp=?, address=?, notes=? WHERE id=?')
      .run(name || c.name, email !== undefined ? email : c.email, whatsapp !== undefined ? whatsapp : c.whatsapp, address !== undefined ? address : c.address, notes !== undefined ? notes : c.notes, req.params.id);
    res.json(db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id));
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
};

exports.delete = (req, res) => {
  try {
    if (!db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id)) return res.status(404).json({ message: 'Customer tidak ditemukan' });
    db.prepare('DELETE FROM customers WHERE id = ?').run(req.params.id);
    res.json({ message: 'Customer berhasil dihapus' });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
};

exports.toggleBlacklist = (req, res) => {
  try {
    const c = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    if (!c) return res.status(404).json({ message: 'Customer tidak ditemukan' });
    db.prepare('UPDATE customers SET is_blacklisted = ? WHERE id = ?').run(c.is_blacklisted ? 0 : 1, req.params.id);
    res.json({ message: c.is_blacklisted ? 'Customer di-unblock' : 'Customer di-blacklist' });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
};
