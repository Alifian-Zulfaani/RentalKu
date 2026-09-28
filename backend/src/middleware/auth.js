const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === "production"
    ? null
    : "rentalku-development-secret");

function authMiddleware(req, res, next) {
  if (!JWT_SECRET) {
    return res
      .status(500)
      .json({ message: "Konfigurasi autentikasi belum lengkap" });
  }
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Token tidak valid atau sudah expired" });
  }
}

module.exports = { authMiddleware, JWT_SECRET };
