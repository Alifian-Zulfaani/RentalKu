const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { body } = require("express-validator");
const { sendValidationErrors } = require("../utils/http");

router.post(
  "/login",
  body("email")
    .trim()
    .isEmail()
    .withMessage("Email tidak valid")
    .normalizeEmail(),
  body("password")
    .isString()
    .isLength({ min: 6, max: 200 })
    .withMessage("Password wajib diisi"),
  sendValidationErrors,
  authController.login,
);
module.exports = router;
