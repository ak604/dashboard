// services/performanceService.js
const { dynamoDB, UpdateCommand } = require('../config/db');

const updatePerformanceMetric = async (metricId, metricValue) => {
  const params = {
    TableName: 'PerformanceMetrics',
    Key: { metric_id: metricId },
    UpdateExpression: 'SET metric_value = :metricValue',
    ExpressionAttributeValues: {
      ':metricValue': metricValue,
    },
    ReturnValues: 'UPDATED_NEW',
  };

  await dynamoDB.send(new UpdateCommand(params)); // Use `send` with the new SDK
};

module.exports = { updatePerformanceMetric };
