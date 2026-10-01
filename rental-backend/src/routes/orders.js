const express = require("express");
const router = express.Router();
const oc = require("../controllers/orderController");
const { body, param, query } = require("express-validator");
const { sendValidationErrors } = require("../utils/http");

const idValidator = param("id").isInt({ min: 1 }).toInt();

router.get("/stats", oc.getStats);
router.get(
  "/",
  query("search").optional().trim().isLength({ max: 100 }),
  query("status")
    .optional({ checkFalsy: true })
    .isIn(["booking", "active", "late", "completed", "cancelled"]),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  sendValidationErrors,
  oc.getAll,
);
router.get("/:id", idValidator, sendValidationErrors, oc.getById);
router.post(
  "/",
  body("customer_id").isInt({ min: 1 }).toInt(),
  body("start_date").matches(/^\d{4}-\d{2}-\d{2}$/),
  body("end_date").matches(/^\d{4}-\d{2}-\d{2}$/),
  body("items").isArray({ min: 1, max: 50 }),
  body("items.*.inventory_id").isInt({ min: 1 }).toInt(),
  body("items.*.quantity").isInt({ min: 1, max: 100 }).toInt(),
  body("items.*.rate_type").optional().isIn(["daily", "weekly", "monthly"]),
  body("notes").optional({ checkFalsy: true }).trim().isLength({ max: 1000 }),
  sendValidationErrors,
  oc.create,
);
router.patch(
  "/:id/status",
  idValidator,
  body("status").isIn(["booking", "active", "late", "completed", "cancelled"]),
  sendValidationErrors,
  oc.updateStatus,
);
module.exports = router;
