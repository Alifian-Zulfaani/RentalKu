const express = require('express');
const router = express.Router();
const subscriberController = require('../controllers/subscriberController');

router.get('/stats', subscriberController.getStats);
router.get('/', subscriberController.getAll);
router.get('/:id', subscriberController.getById);
router.patch('/:id/status', subscriberController.updateStatus);
router.delete('/:id', subscriberController.delete);

module.exports = router;
