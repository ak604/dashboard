const userService = require('../services/userService');
const appService = require('../services/appService');
const rewardService = require('../services/rewardService');
const walletTransactionService = require('../services/walletTransactionService');
const logger = require('../utils/logger');

/**
 * Load application initialization data including user and app details
 * Apply rewards only if 24 hours have passed since last reward
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
    
    // Fetch user data, app data, and rewards data in parallel
    const [userData, appData, rewards] = await Promise.all([
      userService.getUser(contextId, userId),
      appService.getApp(contextId),
      rewardService.getRewards(contextId)
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
    
    // Initialize user rewards array
    const userRewards = [];
    let updatedWallet = { ...(userData.wallet || {}) };
    
    // Check if we should apply rewards (if 24 hours have passed since last reward)
    const now = new Date();
    const lastRewardTime = userData.lastRewardTime ? new Date(userData.lastRewardTime) : null;
    const shouldApplyRewards = !lastRewardTime || 
      (now.getTime() - lastRewardTime.getTime() >=  60 * 1000);
    
    // Track transactions to create
    const transactions = [];
    
    if (shouldApplyRewards) {
      // Filter active rewards
      const activeRewards = rewards.filter(reward => reward.active === true);
      
      // Process each active reward and apply it to the user's wallet
      for (const reward of activeRewards) {
        // Track which rewards we're applying
        const rewardTokens = {};
        
        // Apply each token in the reward to the user's wallet
        for (const tokenReward of reward.rewards) {
          const { tokenName, tokenAmount } = tokenReward;
          
          // Add to the user's wallet
          updatedWallet[tokenName] = (updatedWallet[tokenName] || 0) + tokenAmount;
          
          // Track what we're adding for this reward
          rewardTokens[tokenName] = tokenAmount;
          
          // Create transaction record
          transactions.push({
            contextId,
            userId,
            type: walletTransactionService.TRANSACTION_TYPES.CREDIT,
            tokenName,
            tokenAmount,
            description: `Daily reward: ${reward.rewardId}`,
            metadata: {
              rewardId: reward.rewardId,
              source: 'daily_reward'
            }
          });
        }
        
        // Add to applied rewards list
        userRewards.push({
          rewardId: reward.rewardId,
          tokens: rewardTokens
        });
      }
      
      // Only update the user if rewards were applied
      if (userRewards.length > 0) {
        // Update the user's wallet and lastRewardTime in the database
        await userService.updateUserWithRewards(
          contextId, 
          userId, 
          updatedWallet, 
          now.toISOString()
        );
        
        // Create all transaction records
        await walletTransactionService.batchCreateTransactions(transactions);
      }
    }
    
    // Remove sensitive fields from user data
    const safeUserData = {
      userId: userData.userId,
      name: userData.name,
      email: userData.email,
      picture: userData.picture,
      accessLevel: userData.accessLevel,
      wallet: updatedWallet,  // Use the updated wallet
      lastRewardTime: shouldApplyRewards && userRewards.length > 0 ? now.toISOString() : userData.lastRewardTime,
      createdAt: userData.createdAt
    };
    
    // Return combined data
    res.json({
      success: true,
      data: {
        user: safeUserData,
        app: appData,
        userRewards: userRewards,
        rewardsApplied: shouldApplyRewards && userRewards.length > 0
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