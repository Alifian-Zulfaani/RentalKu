const express = require("express");
const router = express.Router();
const pc = require("../controllers/publicController");
router.get("/products", pc.getProducts);
router.get("/categories", pc.getCategories);
router.get("/config", pc.getSiteConfig);
router.post("/booking", pc.createBooking);
module.exports = router;
