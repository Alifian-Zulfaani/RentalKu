const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");
const { JWT_SECRET } = require("../middleware/auth");
const { logServerError } = require("../utils/http");

exports.login = (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = db.prepare("SELECT * FROM admins WHERE email = ?").get(email);

    if (!admin) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    const isMatch = bcrypt.compareSync(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    const token = jwt.sign(
      { id: admin.id, name: admin.name, email: admin.email },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      message: "Login berhasil",
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    logServerError("auth.login", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

exports.me = (req, res) => {
  try {
    const admin = db
      .prepare("SELECT id, name, email, created_at FROM admins WHERE id = ?")
      .get(req.admin.id);
    if (!admin)
      return res.status(404).json({ message: "Admin tidak ditemukan" });
    res.json(admin);
  } catch (err) {
    logServerError("auth.me", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};
