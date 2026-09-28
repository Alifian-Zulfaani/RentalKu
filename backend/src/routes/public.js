const express = require("express");
const router = express.Router();
const publicController = require("../controllers/publicController");
const { body } = require("express-validator");
const { sendValidationErrors } = require("../utils/http");

router.post(
  "/checkout",
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Nama wajib diisi"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Email tidak valid")
    .normalizeEmail(),
  body("whatsapp")
    .trim()
    .matches(/^(?:\+62|62|0)8\d{7,12}$/)
    .withMessage("Nomor WhatsApp tidak valid"),
  body("business_name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Nama bisnis wajib diisi"),
  body("business_type")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Jenis bisnis wajib diisi"),
  body("plan")
    .optional()
    .equals("lifetime")
    .withMessage("Paket tidak tersedia"),
  body("payment_method")
    .optional()
    .isIn(["transfer", "qris", "free"])
    .withMessage("Metode pembayaran tidak valid"),
  sendValidationErrors,
  publicController.checkout,
);

module.exports = router;
