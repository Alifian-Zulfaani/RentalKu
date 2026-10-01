const express = require("express");
const router = express.Router();
const pc = require("../controllers/publicController");
const { body, query } = require("express-validator");
const { sendValidationErrors } = require("../utils/http");

router.get(
  "/products",
  query("category_id").optional({ checkFalsy: true }).isInt({ min: 1 }).toInt(),
  sendValidationErrors,
  pc.getProducts,
);
router.get("/categories", pc.getCategories);
router.get("/config", pc.getSiteConfig);
router.post(
  "/booking",
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Nama wajib diisi"),
  body("whatsapp")
    .trim()
    .matches(/^(?:\+62|62|0)8\d{7,12}$/)
    .withMessage("Nomor WhatsApp tidak valid"),
  body("email")
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage("Email tidak valid")
    .normalizeEmail(),
  body("start_date")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Tanggal mulai tidak valid")
    .custom((value) => {
      const now = new Date();
      const localToday = new Date(
        now.getTime() - now.getTimezoneOffset() * 60_000,
      )
        .toISOString()
        .slice(0, 10);
      if (value < localToday) {
        throw new Error("Tanggal mulai tidak boleh di masa lalu");
      }
      return true;
    }),
  body("end_date")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Tanggal selesai tidak valid"),
  body("items")
    .isArray({ min: 1, max: 20 })
    .withMessage("Pilih setidaknya satu barang"),
  body("items.*.inventory_id").isInt({ min: 1 }).toInt(),
  body("items.*.quantity").isInt({ min: 1, max: 100 }).toInt(),
  body("notes").optional({ checkFalsy: true }).trim().isLength({ max: 1000 }),
  sendValidationErrors,
  pc.createBooking,
);
module.exports = router;
