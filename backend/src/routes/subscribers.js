const express = require("express");
const router = express.Router();
const subscriberController = require("../controllers/subscriberController");
const { body, param, query } = require("express-validator");
const { sendValidationErrors } = require("../utils/http");

const idValidator = param("id")
  .isInt({ min: 1 })
  .toInt()
  .withMessage("ID tidak valid");

router.get("/stats", subscriberController.getStats);
router.get(
  "/",
  query("search").optional().trim().isLength({ max: 100 }),
  query("status")
    .optional({ checkFalsy: true })
    .isIn(["pending", "confirmed", "rejected"]),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  sendValidationErrors,
  subscriberController.getAll,
);
router.get(
  "/:id",
  idValidator,
  sendValidationErrors,
  subscriberController.getById,
);
router.patch(
  "/:id/status",
  idValidator,
  body("status")
    .isIn(["pending", "confirmed", "rejected"])
    .withMessage("Status tidak valid"),
  body("notes").optional().trim().isLength({ max: 1000 }),
  sendValidationErrors,
  subscriberController.updateStatus,
);
router.delete(
  "/:id",
  idValidator,
  sendValidationErrors,
  subscriberController.delete,
);

module.exports = router;
