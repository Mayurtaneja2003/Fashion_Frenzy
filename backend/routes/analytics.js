const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/analytics/:period', analyticsController.getAnalytics);

module.exports = router;