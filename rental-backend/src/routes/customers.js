const express = require("express");
const router = express.Router();
const cc = require("../controllers/customerController");
const { body, param, query } = require("express-validator");
const { sendValidationErrors } = require("../utils/http");

const idValidator = param("id").isInt({ min: 1 }).toInt();
const customerValidators = [
  body("name").optional().trim().isLength({ min: 2, max: 100 }),
  body("email")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isEmail()
    .normalizeEmail(),
  body("whatsapp")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 30 }),
  body("address").optional({ nullable: true }).trim().isLength({ max: 500 }),
  body("notes").optional({ nullable: true }).trim().isLength({ max: 1000 }),
];

router.get(
  "/",
  query("search").optional().trim().isLength({ max: 100 }),
  query("is_blacklisted")
    .optional({ checkFalsy: true })
    .isIn(["0", "1"])
    .toInt(),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  sendValidationErrors,
  cc.getAll,
);
router.get("/:id", idValidator, sendValidationErrors, cc.getById);
router.post(
  "/",
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Nama wajib diisi"),
  ...customerValidators.slice(1),
  sendValidationErrors,
  cc.create,
);
router.put(
  "/:id",
  idValidator,
  ...customerValidators,
  sendValidationErrors,
  cc.update,
);
router.delete("/:id", idValidator, sendValidationErrors, cc.delete);
router.patch(
  "/:id/blacklist",
  idValidator,
  sendValidationErrors,
  cc.toggleBlacklist,
);
module.exports = router;
