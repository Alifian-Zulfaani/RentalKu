const express = require("express");
const cors = require("cors");

require("./config/database");

const authRoutes = require("./routes/auth");
const inventoryRoutes = require("./routes/inventory");
const customerRoutes = require("./routes/customers");
const orderRoutes = require("./routes/orders");
const siteConfigRoutes = require("./routes/siteConfig");
const publicRoutes = require("./routes/public");
const { authMiddleware } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3001;

app.disable("x-powered-by");

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET wajib diisi pada environment production");
}

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5174")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin tidak diizinkan oleh CORS"));
    },
  }),
);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

app.use("/api/auth", authRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/inventory", authMiddleware, inventoryRoutes);
app.use("/api/customers", authMiddleware, customerRoutes);
app.use("/api/orders", authMiddleware, orderRoutes);
app.use("/api/site-config", authMiddleware, siteConfigRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Customer Tenant API running" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint tidak ditemukan" });
});

app.use((error, req, res, next) => {
  console.error("[api]", error);
  const status =
    error.message === "Origin tidak diizinkan oleh CORS" ? 403 : 500;
  res.status(status).json({
    message:
      status === 403
        ? "Origin ini tidak diizinkan mengakses API"
        : "Terjadi kesalahan pada server",
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🏪 Customer Tenant API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
