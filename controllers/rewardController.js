const rewardService = require('../services/rewardService');
const logger = require('../utils/logger');

/**
 * Create a new reward
 */
const createReward = async (req, res) => {
  try {
    const { contextId } = req.params;
    const rewardData = req.body;
    
    // Validate required fields
    if (!rewardData.rewardId) {
      return res.status(400).json({
        success: false,
        message: 'rewardId is required'
      });
    }
    
    // Validate rewards array format if provided
    if (rewardData.rewards) {
      if (!Array.isArray(rewardData.rewards)) {
        return res.status(400).json({
          success: false,
          message: 'Rewards must be an array'
        });
      }
      
      // Validate each reward object in the array
      for (const reward of rewardData.rewards) {
        if (!reward.tokenName || typeof reward.tokenAmount !== 'number') {
          return res.status(400).json({
            success: false,
            message: 'Each reward must have tokenName and tokenAmount properties'
          });
        }
      }
    }
    
    const reward = await rewardService.createReward(contextId, rewardData);
    
    res.status(201).json({
      success: true,
      data: reward
    });
  } catch (error) {
    logger.error('Error creating reward:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating reward',
      error: error.message
    });
  }
};

/**
 * Get a reward by ID
 */
const getReward = async (req, res) => {
  try {
    const { contextId, rewardId } = req.params;
    
    const reward = await rewardService.getReward(contextId, rewardId);
    
    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }
    
    res.json({
      success: true,
      data: reward
    });
  } catch (error) {
    logger.error('Error getting reward:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting reward',
      error: error.message
    });
  }
};

/**
 * Get all rewards for a context
 */
const getRewards = async (req, res) => {
  try {
    const { contextId } = req.params;
    
    const rewards = await rewardService.getRewards(contextId);
    
    res.json({
      success: true,
      data: rewards
    });
  } catch (error) {
    logger.error('Error getting rewards:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting rewards',
      error: error.message
    });
  }
};

/**
 * Update a reward
 */
const updateReward = async (req, res) => {
  try {
    const { contextId, rewardId } = req.params;
    const updates = req.body;
    
    // Validate rewards array format if provided
    if (updates.rewards) {
      if (!Array.isArray(updates.rewards)) {
        return res.status(400).json({
          success: false,
          message: 'Rewards must be an array'
        });
      }
      
      // Validate each reward object in the array
      for (const reward of updates.rewards) {
        if (!reward.tokenName || typeof reward.tokenAmount !== 'number') {
          return res.status(400).json({
            success: false,
            message: 'Each reward must have tokenName and tokenAmount properties'
          });
        }
      }
    }
    
    const reward = await rewardService.updateReward(contextId, rewardId, updates);
    
    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }
    
    res.json({
      success: true,
      data: reward
    });
  } catch (error) {
    logger.error('Error updating reward:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating reward',
      error: error.message
    });
  }
};

/**
 * Delete a reward
 */
const deleteReward = async (req, res) => {
  try {
    const { contextId, rewardId } = req.params;
    
    const reward = await rewardService.deleteReward(contextId, rewardId);
    
    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }
    
    res.json({
      success: true,
      data: reward,
      message: 'Reward deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting reward:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting reward',
      error: error.message
    });
  }
};

module.exports = {
  createReward,
  getReward,
  getRewards,
  updateReward,
  deleteReward
}; 