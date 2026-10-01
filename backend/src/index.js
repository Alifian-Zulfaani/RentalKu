require("./config/env");

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const db = require("./config/database");

const authRoutes = require("./routes/auth");
const subscriberRoutes = require("./routes/subscribers");
const publicRoutes = require("./routes/public");
const { authMiddleware } = require("./middleware/auth");
const { sendProblem, logServerError } = require("./utils/http");

const app = express();
const PORT = process.env.PORT || 3000;

app.disable("x-powered-by");

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET wajib diisi pada environment production");
}
if (process.env.NODE_ENV === "production") {
  const weakAdmin = db.prepare("SELECT password FROM admins").all()
    .some(({ password }) => bcrypt.compareSync("admin123", password));
  if (weakAdmin) {
    throw new Error("Kata sandi admin bawaan harus diganti sebelum menjalankan production.");
  }
}

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin))
        return callback(null, true);
      return callback(new Error("Origin tidak diizinkan oleh CORS"));
    },
  }),
);
app.use(express.json({ limit: "100kb" }));

// Public routes
app.use("/api/auth", authRoutes);
app.use("/api/public", publicRoutes);

// Protected admin routes
app.use("/api/subscribers", authMiddleware, subscriberRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ data: { status: "ok" } });
});

app.use((req, res) => {
  sendProblem(req, res, 404, "Endpoint tidak ditemukan.");
});

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return sendProblem(req, res, 400, "Format JSON tidak valid.");
  }
  if (err.type === "entity.too.large") {
    return sendProblem(req, res, 413, "Data yang dikirim terlalu besar.");
  }
  if (err.message === "Origin tidak diizinkan oleh CORS") {
    return sendProblem(req, res, 403, "Origin ini tidak diizinkan mengakses API.");
  }
  logServerError("api", err);
  return sendProblem(req, res, 500, "Layanan sedang mengalami gangguan. Coba lagi nanti.");
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 RentalKu Company API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
