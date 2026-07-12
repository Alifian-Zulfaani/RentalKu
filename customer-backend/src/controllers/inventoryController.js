const db = require('../config/database');

exports.getCategories = (req, res) => {
  try { res.json(db.prepare('SELECT * FROM categories ORDER BY name').all()); }
  catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
};

exports.getAll = (req, res) => {
  try {
    const { search, status, category_id, page = 1, limit = 10 } = req.query;
    let q = `SELECT i.*, c.name as category_name FROM inventory i LEFT JOIN categories c ON i.category_id = c.id WHERE 1=1`;
    const p = [];
    if (search) { q += ` AND i.name LIKE ?`; p.push(`%${search}%`); }
    if (status) { q += ` AND i.status = ?`; p.push(status); }
    if (category_id) { q += ` AND i.category_id = ?`; p.push(category_id); }

    const countQ = q.replace(/SELECT .+? FROM/, 'SELECT COUNT(*) as total FROM');
    const { total } = db.prepare(countQ).get(...p);
    const offset = (page - 1) * limit;
    q += ` ORDER BY i.created_at DESC LIMIT ? OFFSET ?`;
    p.push(Number(limit), offset);

    res.json({ data: db.prepare(q).all(...p), pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) } });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
};

exports.getById = (req, res) => {
  try {
    const item = db.prepare('SELECT i.*, c.name as category_name FROM inventory i LEFT JOIN categories c ON i.category_id = c.id WHERE i.id = ?').get(req.params.id);
    if (!item) return res.status(404).json({ message: 'Barang tidak ditemukan' });
    res.json(item);
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
};

exports.create = (req, res) => {
  try {
    const { name, category_id, stock, rate_daily, rate_weekly, rate_monthly, status, image_url, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Nama barang wajib diisi' });
    const result = db.prepare(`INSERT INTO inventory (name, category_id, stock, available_stock, rate_daily, rate_weekly, rate_monthly, status, image_url, description) VALUES (?,?,?,?,?,?,?,?,?,?)`)
      .run(name, category_id || null, stock || 0, stock || 0, rate_daily || 0, rate_weekly || 0, rate_monthly || 0, status || 'active', image_url || null, description || null);
    res.status(201).json(db.prepare('SELECT * FROM inventory WHERE id = ?').get(result.lastInsertRowid));
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
};

exports.update = (req, res) => {
  try {
    const item = db.prepare('SELECT * FROM inventory WHERE id = ?').get(req.params.id);
    if (!item) return res.status(404).json({ message: 'Barang tidak ditemukan' });
    const { name, category_id, stock, rate_daily, rate_weekly, rate_monthly, status, image_url, description } = req.body;
    const rentedQty = item.stock - item.available_stock;
    const newAvail = Math.max(0, (stock !== undefined ? stock : item.stock) - rentedQty);
    db.prepare(`UPDATE inventory SET name=?, category_id=?, stock=?, available_stock=?, rate_daily=?, rate_weekly=?, rate_monthly=?, status=?, image_url=?, description=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`)
      .run(name || item.name, category_id !== undefined ? category_id : item.category_id, stock !== undefined ? stock : item.stock, newAvail, rate_daily !== undefined ? rate_daily : item.rate_daily, rate_weekly !== undefined ? rate_weekly : item.rate_weekly, rate_monthly !== undefined ? rate_monthly : item.rate_monthly, status || item.status, image_url !== undefined ? image_url : item.image_url, description !== undefined ? description : item.description, req.params.id);
    res.json(db.prepare('SELECT * FROM inventory WHERE id = ?').get(req.params.id));
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
};

exports.delete = (req, res) => {
  try {
    const item = db.prepare('SELECT * FROM inventory WHERE id = ?').get(req.params.id);
    if (!item) return res.status(404).json({ message: 'Barang tidak ditemukan' });
    db.prepare('DELETE FROM inventory WHERE id = ?').run(req.params.id);
    res.json({ message: 'Barang berhasil dihapus' });
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
};
