const express = require("express");
const router = express.Router();
const sc = require("../controllers/siteConfigController");
const { body } = require("express-validator");
const { sendValidationErrors } = require("../utils/http");

router.get("/", sc.getConfig);
router.put(
  "/",
  body("business_name").optional().trim().isLength({ min: 2, max: 100 }),
  body("tagline").optional({ nullable: true }).trim().isLength({ max: 160 }),
  body("description")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 }),
  body("logo_url")
    .optional({ nullable: true, checkFalsy: true })
    .isURL({ protocols: ["http", "https"], require_protocol: true }),
  body("primary_color")
    .optional()
    .matches(/^#[0-9a-f]{6}$/i),
  body("secondary_color")
    .optional()
    .matches(/^#[0-9a-f]{6}$/i),
  body("whatsapp").optional({ nullable: true }).trim().isLength({ max: 30 }),
  body("email")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isEmail()
    .normalizeEmail(),
  body("address").optional({ nullable: true }).trim().isLength({ max: 500 }),
  body("hero_title").optional({ nullable: true }).trim().isLength({ max: 140 }),
  body("hero_subtitle")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 300 }),
  body("about_text")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 3000 }),
  sendValidationErrors,
  sc.updateConfig,
);
module.exports = router;
