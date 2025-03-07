const { dynamoDB, PutCommand, GetCommand, DeleteCommand, QueryCommand, UpdateCommand, REWARDS_TABLE } = require('../config/db');
const logger = require('../utils/logger');

/**
 * Create a new reward
 * 
 * @param {string} contextId - The context ID (app)
 * @param {object} rewardData - The reward data
 * @param {string} rewardData.rewardId - The reward ID (must be provided by user)
 * @param {array} rewardData.rewards - Array of token-amount pairs
 * @returns {Promise<object>} The created reward
 */
const createReward = async (contextId, rewardData) => {
  try {
    if (!rewardData.rewardId) {
      throw new Error('rewardId is required');
    }
    
    const timestamp = new Date().toISOString();
    
    const reward = {
      contextId,
      rewardId: rewardData.rewardId,
      rewards: rewardData.rewards || [],
      active: rewardData.active !== false, // Default to true if not provided
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    const params = new PutCommand({
      TableName: REWARDS_TABLE,
      Item: reward
    });
    
    await dynamoDB.send(params);
    return reward;
  } catch (error) {
    logger.error('Error creating reward:', error);
    throw error;
  }
};

/**
 * Get a reward by ID
 * 
 * @param {string} contextId - The context ID (app)
 * @param {string} rewardId - The reward ID
 * @returns {Promise<object|null>} The reward or null if not found
 */
const getReward = async (contextId, rewardId) => {
  try {
    const params = {
      TableName: REWARDS_TABLE,
      Key: {
        contextId,
        rewardId
      }
    };
    
    const result = await dynamoDB.send(new GetCommand(params));
    return result.Item || null;
  } catch (error) {
    logger.error('Error getting reward:', error);
    throw error;
  }
};

/**
 * Get all rewards for a context
 * 
 * @param {string} contextId - The context ID (app)
 * @returns {Promise<Array>} List of rewards
 */
const getRewards = async (contextId) => {
  try {
    const queryParams = {
      TableName: REWARDS_TABLE,
      KeyConditionExpression: 'contextId = :contextId',
      ExpressionAttributeValues: {
        ':contextId': contextId
      }
    };
    
    const result = await dynamoDB.send(new QueryCommand(queryParams));
    
    return result.Items || [];
  } catch (error) {
    logger.error('Error getting rewards:', error);
    throw error;
  }
};

/**
 * Update a reward
 * 
 * @param {string} contextId - The context ID (app)
 * @param {string} rewardId - The reward ID
 * @param {object} updates - The updates to apply
 * @returns {Promise<object|null>} The updated reward or null if not found
 */
const updateReward = async (contextId, rewardId, updates) => {
  try {
    // First check if the reward exists
    const existingReward = await getReward(contextId, rewardId);
    if (!existingReward) {
      return null;
    }
    
    // Prepare update expressions
    let updateExpression = 'SET updatedAt = :updatedAt';
    const expressionAttributeValues = {
      ':updatedAt': new Date().toISOString()
    };
    
    // Add each field to the update expression
    const updateFields = ['rewards', 'active'];
    updateFields.forEach(field => {
      if (updates[field] !== undefined) {
        updateExpression += `, ${field} = :${field}`;
        expressionAttributeValues[`:${field}`] = updates[field];
      }
    });
    
    const params = {
      TableName: REWARDS_TABLE,
      Key: {
        contextId,
        rewardId
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    };
    
    const result = await dynamoDB.send(new UpdateCommand(params));
    return result.Attributes || null;
  } catch (error) {
    logger.error('Error updating reward:', error);
    throw error;
  }
};

/**
 * Delete a reward
 * 
 * @param {string} contextId - The context ID (app)
 * @param {string} rewardId - The reward ID
 * @returns {Promise<object|null>} The deleted reward or null if not found
 */
const deleteReward = async (contextId, rewardId) => {
  try {
    // First check if the reward exists
    const existingReward = await getReward(contextId, rewardId);
    if (!existingReward) {
      return null;
    }
    
    const params = {
      TableName: REWARDS_TABLE,
      Key: {
        contextId,
        rewardId
      },
      ReturnValues: 'ALL_OLD'
    };
    
    const result = await dynamoDB.send(new DeleteCommand(params));
    return result.Attributes || null;
  } catch (error) {
    logger.error('Error deleting reward:', error);
    throw error;
  }
};

module.exports = {
  createReward,
  getReward,
  getRewards,
  updateReward,
  deleteReward
}; 