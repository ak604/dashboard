// controllers/performanceController.js
const performanceService = require('../services/performanceService');
const logger = require('../utils/logger');

const updatePerformanceMetric = async (req, res) => {
  try {
    const { metricId } = req.params;
    const { metricValue } = req.body;
    await performanceService.updatePerformanceMetric(metricId, metricValue);
    res.status(200).send({ message: 'Performance metric updated successfully' });
  } catch (error) {
    logger.error('Error updating performance metric: ', error);
    res.status(500).send({ message: 'Error updating performance metric', error });
  }
};

module.exports = { updatePerformanceMetric };
