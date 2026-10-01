const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");
const { apiError: error, asyncHandler: route } = require("../utils/http");
const router = express.Router();

router.post(
  "/login",
  route((req, res) => {
    if (
      typeof req.body.email !== "string" ||
      !req.body.email.trim() ||
      typeof req.body.password !== "string" ||
      !req.body.password
    )
      error(422, "Email dan kata sandi wajib diisi");
    const account = db
      .prepare("SELECT * FROM admins WHERE email = ? COLLATE NOCASE")
      .get(req.body.email);
    if (
      !account ||
      !bcrypt.compareSync(
        String(req.body.password || ""),
        account.password_hash,
      )
    )
      error(401, "Email atau kata sandi salah");
    const token = jwt.sign(
      { adminId: account.id, tenantId: account.tenant_id },
      process.env.JWT_SECRET || "development-only-change-me",
      { expiresIn: "12h" },
    );
    res.json({
      token,
      account: {
        id: account.id,
        email: account.email,
        role: account.role,
        professional_id: account.professional_id,
      },
      tenant: db
        .prepare("SELECT id, slug, name FROM tenants WHERE id = ?")
        .get(account.tenant_id),
    });
  }),
);

module.exports = router;
