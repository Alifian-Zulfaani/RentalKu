const express = require('express');
const router = express.Router();
const oc = require('../controllers/orderController');
router.get('/stats', oc.getStats);
router.get('/', oc.getAll);
router.get('/:id', oc.getById);
router.post('/', oc.create);
router.patch('/:id/status', oc.updateStatus);
module.exports = router;
