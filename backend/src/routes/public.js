const express = require("express");
const router = express.Router();
const publicController = require("../controllers/publicController");

router.post("/checkout", publicController.checkout);

module.exports = router;
