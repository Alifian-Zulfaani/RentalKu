const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");
const { JWT_SECRET } = require("../middleware/auth");
const { sendServerError } = require("../utils/http");

exports.login = (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = db
      .prepare("SELECT * FROM admins WHERE email = ? COLLATE NOCASE")
      .get(email);
    if (!admin)
      return res.status(401).json({ message: "Email atau password salah" });
    const valid = bcrypt.compareSync(password, admin.password);
    if (!valid)
      return res.status(401).json({ message: "Email atau password salah" });
    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name },
      JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.json({
      message: "Login berhasil",
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    sendServerError(res, "auth.login", err);
  }
};
