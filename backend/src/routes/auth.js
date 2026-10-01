const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authMiddleware } = require("../middleware/auth");
const { body } = require("express-validator");
const { sendValidationErrors } = require("../utils/http");

router.post(
  "/login",
  body("email")
    .trim()
    .isEmail()
    .withMessage("Email tidak valid")
    .normalizeEmail(),
  body("password").isString().notEmpty().withMessage("Kata sandi wajib diisi"),
  sendValidationErrors,
  authController.login,
);
router.get("/me", authMiddleware, authController.me);

module.exports = router;
