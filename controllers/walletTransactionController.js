const walletTransactionService = require('../services/walletTransactionService');
const logger = require('../utils/logger');

/**
 * Get user's wallet transactions
 */
const getUserTransactions = async (req, res) => {
  try {
    const { contextId } = req.params;
    const userId = req.user.userId;
    
    // Parse query parameters
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
    const startTime = req.query.startTime ? parseInt(req.query.startTime, 10) : null;
    
    const result = await walletTransactionService.getUserTransactions(
      contextId,
      userId,
      limit,
      startTime
    );
    
    res.json({
      success: true,
      data: result.transactions,
      pagination: {
        lastEvaluatedKey: result.lastEvaluatedKey
      }
    });
  } catch (error) {
    logger.error('Error getting wallet transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting wallet transactions',
      error: error.message
    });
  }
};

module.exports = {
  getUserTransactions
}; 