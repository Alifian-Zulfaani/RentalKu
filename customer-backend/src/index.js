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

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public routes (no auth)
app.use("/api/auth", authRoutes);
app.use("/api/public", publicRoutes);

// Protected admin routes
app.use("/api/inventory", authMiddleware, inventoryRoutes);
app.use("/api/customers", authMiddleware, customerRoutes);
app.use("/api/orders", authMiddleware, orderRoutes);
app.use("/api/site-config", authMiddleware, siteConfigRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Customer Tenant API running" });
});

app.listen(PORT, () => {
  console.log(`🏪 Customer Tenant API running on http://localhost:${PORT}`);
});
