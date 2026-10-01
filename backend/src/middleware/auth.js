const jwt = require("jsonwebtoken");
const db = require("../config/database");
const { sendProblem } = require("../utils/http");

const JWT_SECRET =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === "production"
    ? null
    : "rentalku-development-secret");

function authMiddleware(req, res, next) {
  if (!JWT_SECRET) {
    return sendProblem(req, res, 500, "Konfigurasi autentikasi belum lengkap.");
  }
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendProblem(req, res, 401, "Silakan masuk sebagai admin terlebih dahulu.");
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    return sendProblem(req, res, 401, "Sesi sudah berakhir. Silakan masuk kembali.");
  }
  try {
    const admin = db.prepare("SELECT id, name, email FROM admins WHERE id = ?").get(decoded.id);
    if (!admin) return sendProblem(req, res, 401, "Sesi admin tidak lagi berlaku. Silakan masuk kembali.");
    req.admin = admin;
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = { authMiddleware, JWT_SECRET };
