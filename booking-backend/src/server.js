const express = require("express");
const cors = require("cors");
const { isAllowedOrigin } = require("./config/env");
require("./config/database");
const authRoutes = require("./routes/auth");
const publicRoutes = require("./routes/public");
const adminRoutes = require("./routes/admin");
const { authMiddleware } = require("./middleware/auth");
const { errorHandler, notFoundHandler } = require("./utils/http");

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET)
  throw new Error("JWT_SECRET wajib diisi pada production");

const app = express();
app.disable("x-powered-by");
app.use(
  cors({
    origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
  }),
);
app.use(express.json({ limit: "32kb" }));
app.use((req, res, next) => {
  if (
    ["POST", "PUT", "PATCH"].includes(req.method) &&
    (!req.body || typeof req.body !== "object" || Array.isArray(req.body))
  )
    return res.status(422).json({ message: "Body JSON harus berupa objek" });
  next();
});

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/public", publicRoutes);
app.use("/api/admin", authRoutes);
app.use("/api/admin", authMiddleware, adminRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
