const express = require('express');
const router = express.Router();
const sc = require('../controllers/siteConfigController');
router.get('/', sc.getConfig);
router.put('/', sc.updateConfig);
module.exports = router;
