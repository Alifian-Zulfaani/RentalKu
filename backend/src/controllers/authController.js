const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");
const { JWT_SECRET } = require("../middleware/auth");
const { sendProblem, sendServerError } = require("../utils/http");
const { toIsoUtc } = require("../utils/dates");

exports.login = (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = db.prepare("SELECT * FROM admins WHERE email = ? COLLATE NOCASE").get(email);

    if (!admin) {
      return sendProblem(req, res, 401, "Email atau kata sandi salah.");
    }

    const isMatch = bcrypt.compareSync(password, admin.password);
    if (!isMatch) {
      return sendProblem(req, res, 401, "Email atau kata sandi salah.");
    }

    const token = jwt.sign(
      { id: admin.id, name: admin.name, email: admin.email },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      message: "Berhasil masuk.",
      data: { token, admin: { id: admin.id, name: admin.name, email: admin.email } },
    });
  } catch (err) {
    return sendServerError(req, res, "auth.login", err);
  }
};

exports.me = (req, res) => {
  try {
    const admin = db
      .prepare("SELECT id, name, email, created_at FROM admins WHERE id = ?")
      .get(req.admin.id);
    if (!admin) return sendProblem(req, res, 404, "Akun admin tidak ditemukan.");
    res.json({ data: { ...admin, created_at: toIsoUtc(admin.created_at) } });
  } catch (err) {
    return sendServerError(req, res, "auth.me", err);
  }
};
