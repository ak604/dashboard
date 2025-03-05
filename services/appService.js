const { dynamoDB, PutCommand, GetCommand, QueryCommand, UpdateCommand, APPS_TABLE } = require('../config/db');
const { v4: uuidv4 } = require("uuid");

const createApp = async (appId, name, description = '') => {
    const app = {
        appId,
        name,
        description,
        createdAt: new Date().toISOString()
    };

    const params = new PutCommand({
        TableName: APPS_TABLE,
        Item: app
    });

    await dynamoDB.send(params);
};

const getApp = async (appId) => {
    const params = {
        TableName: APPS_TABLE,
        Key: { appId }
    };

    const result = await dynamoDB.send(new GetCommand(params));
    return result.Item;
};

/**
 * Update app costs
 * @param {string} appId - App ID
 * @param {Object} costs - Map of task names to cost configurations
 * @returns {Promise<Object>} Updated app costs
 */
const updateAppCosts = async (appId, costs) => {
  try {
    const app = await getApp(appId);
    if (!app) {
      throw new Error('App not found');
    }
    
    const params = {
      TableName: APPS_TABLE,
      Key: { appId },
      UpdateExpression: "SET costs = :costs",
      ExpressionAttributeValues: {
        ":costs": costs
      },
      ReturnValues: "UPDATED_NEW"
    };
    
    const result = await dynamoDB.send(new UpdateCommand(params));
    return result.Attributes.costs;
  } catch (error) {
    console.error("Error updating app costs:", error);
    throw error;
  }
};

/**
 * Get cost for a specific task and duration
 * @param {string} appId - App ID
 * @param {string} task - Task name
 * @param {number} durationSeconds - Duration in seconds
 * @returns {Promise<Object>} Cost details with tokenName and tokenAmount
 */
const getCostForTask = async (appId, task, durationSeconds) => {
  try {
    const app = await getApp(appId);
    if (!app || !app.costs || !app.costs[task]) {
      throw new Error(`No cost configuration found for task: ${task}`);
    }
    
    const costConfig = app.costs[task];
    const { tokenName, costThresholdValues } = costConfig;
    
    // Sort thresholds by duration (first element in pair)
    const sortedThresholds = [...costThresholdValues].sort((a, b) => a[0] - b[0]);
    
    // Find the appropriate threshold
    let tokenAmount = 0;
    for (let i = 0; i < sortedThresholds.length; i++) {
      const [threshold, cost] = sortedThresholds[i];
      if (durationSeconds <= threshold) {
        tokenAmount = cost;
        break;
      }
      
      // If this is the last threshold and duration is greater
      if (i === sortedThresholds.length - 1) {
        tokenAmount = cost;
      }
    }
    
    return {
      tokenName,
      tokenAmount
    };
  } catch (error) {
    console.error("Error getting cost for task:", error);
    throw error;
  }
};

module.exports = {
    createApp,
    getApp,
    updateAppCosts,
    getCostForTask
}; 