// routes/performanceRoutes.js
const express = require('express');
const performanceController = require('../controllers/performanceController');

const router = express.Router();

router.put('/:metricId', performanceController.updatePerformanceMetric);

module.exports = router;
