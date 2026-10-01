const express = require("express");
const router = express.Router();
const ic = require("../controllers/inventoryController");
const { body, param, query } = require("express-validator");
const { sendValidationErrors } = require("../utils/http");

const idValidator = param("id").isInt({ min: 1 }).toInt();
const itemValidators = [
  body("name").optional().trim().isLength({ min: 2, max: 150 }),
  body("category_id")
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .toInt(),
  body("stock").optional().isInt({ min: 0, max: 100000 }).toInt(),
  body("rate_daily").optional().isFloat({ min: 0 }).toFloat(),
  body("rate_weekly").optional().isFloat({ min: 0 }).toFloat(),
  body("rate_monthly").optional().isFloat({ min: 0 }).toFloat(),
  body("status").optional().isIn(["active", "maintenance", "inactive"]),
  body("image_url")
    .optional({ nullable: true, checkFalsy: true })
    .isURL({ protocols: ["http", "https"], require_protocol: true }),
  body("description")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 }),
];

router.get("/categories", ic.getCategories);
router.get(
  "/",
  query("search").optional().trim().isLength({ max: 100 }),
  query("status")
    .optional({ checkFalsy: true })
    .isIn(["active", "maintenance", "inactive"]),
  query("category_id").optional({ checkFalsy: true }).isInt({ min: 1 }).toInt(),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  sendValidationErrors,
  ic.getAll,
);
router.get("/:id", idValidator, sendValidationErrors, ic.getById);
router.post(
  "/",
  body("name")
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage("Nama barang wajib diisi"),
  body("stock").isInt({ min: 0, max: 100000 }).toInt(),
  ...itemValidators.slice(1),
  sendValidationErrors,
  ic.create,
);
router.put(
  "/:id",
  idValidator,
  ...itemValidators,
  sendValidationErrors,
  ic.update,
);
router.delete("/:id", idValidator, sendValidationErrors, ic.delete);
module.exports = router;
