const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === "production"
    ? null
    : "customer-rentalku-development-secret");

exports.authMiddleware = (req, res, next) => {
  if (!JWT_SECRET) {
    return res
      .status(500)
      .json({ message: "Konfigurasi autentikasi belum lengkap" });
  }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    return res
      .status(401)
      .json({ message: "Token tidak valid atau sudah expired" });
  }
};

exports.JWT_SECRET = JWT_SECRET;
