const userService = require('../services/userService');
const appService = require('../services/appService');
const logger = require('../utils/logger');

/**
 * Load application initialization data including user and app details
 */
const loadAppData = async (req, res) => {
  try {
    // Get userId and contextId (appId) from JWT token
    const { userId, contextId } = req.user;
    
    if (!userId || !contextId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid authentication token. Missing userId or appId.'
      });
    }
    
    
    // Fetch user data and app data in parallel
    const [userData, appData] = await Promise.all([
      userService.getUser(contextId, userId),
      appService.getApp(contextId)
    ]);
    
    // Handle case where user is not found
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Handle case where app is not found
    if (!appData) {
      return res.status(404).json({
        success: false,
        message: 'App not found'
      });
    }
    
    // Remove sensitive fields from user data
    const safeUserData = {
      userId: userData.userId,
      name: userData.name,
      email: userData.email,
      picture: userData.picture,
      accessLevel: userData.accessLevel,
      wallet: userData.wallet || {},
      createdAt: userData.createdAt
    };
    
    // Return combined data
    res.json({
      success: true,
      data: {
        user: safeUserData,
        app: appData
      }
    });
  } catch (error) {
    logger.error('Error loading app data:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading app data',
      error: error.message
    });
  }
};

module.exports = {
  loadAppData
}; 