const express = require("express");
const cors = require("cors");

require("./config/database");

const authRoutes = require("./routes/auth");
const subscriberRoutes = require("./routes/subscribers");
const publicRoutes = require("./routes/public");
const { authMiddleware } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

app.disable("x-powered-by");

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET wajib diisi pada environment production");
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
app.use(express.urlencoded({ extended: true }));

// Public routes
app.use("/api/auth", authRoutes);
app.use("/api/public", publicRoutes);

// Protected admin routes
app.use("/api/subscribers", authMiddleware, subscriberRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "RentalKu Company API running" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint tidak ditemukan" });
});

app.use((err, req, res, next) => {
  console.error("[api]", err);
  const status = err.message === "Origin tidak diizinkan oleh CORS" ? 403 : 500;
  res.status(status).json({
    message:
      status === 403
        ? "Origin ini tidak diizinkan mengakses API"
        : "Terjadi kesalahan pada server",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 RentalKu Company API running on http://localhost:${PORT}`);
});
