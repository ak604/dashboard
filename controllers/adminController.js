const userService = require('../services/userService');
const logger = require('../utils/logger');

/**
 * Admin function to update a user's entire wallet
 */
const updateUserWallet = async (req, res) => {
  try {
    const { contextId, userId } = req.params;
    const { wallet, mode } = req.body;
    
    // Validate input
    if (!wallet || typeof wallet !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Wallet must be a valid object mapping token names to amounts'
      });
    }
    
    // Check for invalid token amounts
    for (const [token, amount] of Object.entries(wallet)) {
      if (isNaN(Number(amount))) {
        return res.status(400).json({
          success: false,
          message: `Invalid amount for token "${token}": ${amount}`
        });
      }
    }
    
    // Get existing wallet for comparison
    const existingWallet = await userService.getUserWallet(contextId, userId);
    
    let updatedWallet;
    
    // Handle different update modes
    if (mode === 'replace') {
      // Replace entire wallet with new values
      const user = await userService.getUser(contextId, userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Create a new user object with the updated wallet
      user.wallet = wallet;
      await userService.updateUser(user);
      
      updatedWallet = wallet;
    } else {
      // Default mode is 'merge' - add/subtract from existing wallet
      updatedWallet = await userService.updateUserWallet(contextId, userId, wallet);
    }
    
    res.json({
      success: true,
      data: {
        userId,
        contextId,
        previous: existingWallet,
        current: updatedWallet,
        mode: mode || 'merge'
      }
    });
  } catch (error) {
    logger.error('Admin error updating user wallet:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user wallet',
      error: error.message
    });
  }
};

/**
 * Admin function to get user wallet
 */
const getUserWallet = async (req, res) => {
  try {
    const { contextId, userId } = req.params;
    
    const wallet = await userService.getUserWallet(contextId, userId);
    
    res.json({
      success: true,
      data: {
        userId,
        contextId,
        wallet
      }
    });
  } catch (error) {
    logger.error('Admin error getting user wallet:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting user wallet',
      error: error.message
    });
  }
};

module.exports = {
  updateUserWallet,
  getUserWallet
}; 