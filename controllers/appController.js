// controllers/appController.js
const appService = require('../services/appService');
const logger = require('../utils/logger');

const createApp = async (req, res) => {
    try {
        const { appId ,name, description } = req.body;

        if (!appId || !name) {
            return res.status(400).json({ 
                success: false,
                message: 'appId and name are required' 
            });
        }

      await appService.createApp(appId, name, description);
        
        res.status(201).json({
            success: true,
            data: {
                appId,
                name,
                description
            }
        });
    } catch (error) {
        logger.error('Error creating app:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating app'
        });
    }
};

const getApp = async (req, res) => {
    try {
        const { appId } = req.params;
        const app = await appService.getApp(appId);

        if (!app) {
            return res.status(404).json({
                success: false,
                message: 'App not found'
            });
        }

        res.json({
            success: true,
            data: app
        });
    } catch (error) {
        logger.error('Error retrieving app:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving app'
        });
    }
};

/**
 * Update app costs
 */
const updateAppCosts = async (req, res) => {
  try {
    const { appId } = req.params;
    const { costs } = req.body;
    
    if (!costs || typeof costs !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Costs object is required'
      });
    }
    
    // Validate each cost configuration
    for (const [task, config] of Object.entries(costs)) {
      if (!config.tokenName || !config.costThresholdValues || !Array.isArray(config.costThresholdValues)) {
        return res.status(400).json({
          success: false,
          message: `Invalid cost configuration for task: ${task}`
        });
      }
      
      // Validate costThresholdValues format
      for (const pair of config.costThresholdValues) {
        if (!Array.isArray(pair) || pair.length !== 2 || typeof pair[0] !== 'number' || typeof pair[1] !== 'number') {
          return res.status(400).json({
            success: false,
            message: `Invalid threshold value pair for task: ${task}`
          });
        }
      }
    }
    
    const updatedCosts = await appService.updateAppCosts(appId, costs);
    
    res.json({
      success: true,
      data: updatedCosts
    });
  } catch (error) {
    logger.error('Error updating app costs:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating app costs',
      error: error.message
    });
  }
};

module.exports = {
    createApp,
    getApp,
    updateAppCosts
};
