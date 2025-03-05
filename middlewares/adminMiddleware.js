const userService = require('../services/userService');
const logger = require('../utils/logger');

/**
 * Middleware to check if the user has admin privileges
 * This version reads the accessLevel directly from the database
 * rather than relying on the JWT token's claim
 */
const isAdmin = async (req, res, next) => {
  try {
    // Get userId and contextId from the JWT token
    if (!req.user || !req.user.userId || !req.user.contextId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - Invalid authentication'
      });
    }
    
    const { userId, contextId } = req.user;
    
    // Fetch the user from the database to get current accessLevel
    const user = await userService.getUser(contextId, userId);
    
    // Check if user exists and has admin role
    if (!user || user.accessLevel !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - Admin access required'
      });
    }
    
    // Add the freshly fetched user to req.dbUser for controllers to use if needed
    req.dbUser = user;
    
    next();
  } catch (error) {
    logger.error('Error in admin authorization:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authorization'
    });
  }
};

module.exports = isAdmin; 