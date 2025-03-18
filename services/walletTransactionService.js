const { dynamoDB, PutCommand, QueryCommand, WALLET_TRANSACTIONS_TABLE } = require('../config/db');
const logger = require('../utils/logger');

/**
 * Transaction types
 */
const TRANSACTION_TYPES = {
  CREDIT: 'credit',
  DEBIT: 'debit'
};

/**
 * Create a wallet transaction
 * 
 * @param {string} contextId - The context ID (app)
 * @param {string} userId - The user ID
 * @param {string} type - Transaction type (credit or debit)
 * @param {string} tokenName - The token name
 * @param {number} tokenAmount - The token amount
 * @param {string} description - Description of the transaction
 * @param {object} metadata - Additional metadata about the transaction
 * @returns {Promise<object>} The created transaction
 */
const createTransaction = async (contextId, userId, type, tokenName, tokenAmount, description, metadata = {}) => {
  try {
    // Validate transaction type
    if (!Object.values(TRANSACTION_TYPES).includes(type)) {
      throw new Error(`Invalid transaction type: ${type}`);
    }
    
    // Create composite key for partitioning
    const contextUserId = `${contextId}:${userId}`;
    
    // Use current epoch time as sort key
    const epochTime = Math.floor(Date.now());
    
    // Create transaction record
    const transaction = {
      contextUserId,
      epochTime,
      contextId,
      userId,
      type,
      tokenName,
      tokenAmount,
      description,
      metadata,
      createdAt: new Date().toISOString()
    };
    
    // Save transaction to DynamoDB
    const params = new PutCommand({
      TableName: WALLET_TRANSACTIONS_TABLE,
      Item: transaction
    });
    
    await dynamoDB.send(params);
    return transaction;
  } catch (error) {
    logger.error('Error creating wallet transaction:', error);
    throw error;
  }
};

/**
 * Get wallet transactions for a user
 * 
 * @param {string} contextId - The context ID (app)
 * @param {string} userId - The user ID
 * @param {number} limit - Maximum number of transactions to return
 * @param {number} startTime - Epoch time to start from (exclusive)
 * @returns {Promise<object>} Transactions and last evaluated key
 */
const getUserTransactions = async (contextId, userId, limit = 50, startTime = null) => {
  try {
    // Create composite key for partitioning
    const contextUserId = `${contextId}:${userId}`;
    
    // Set up query parameters
    const queryParams = {
      TableName: WALLET_TRANSACTIONS_TABLE,
      KeyConditionExpression: 'contextUserId = :contextUserId',
      ExpressionAttributeValues: {
        ':contextUserId': contextUserId
      },
      ScanIndexForward: false, // return in descending order (newest first)
      Limit: limit
    };
    
    // Add start time if provided
    if (startTime) {
      queryParams.KeyConditionExpression += ' AND epochTime < :startTime';
      queryParams.ExpressionAttributeValues[':startTime'] = startTime;
    }
    
    const result = await dynamoDB.send(new QueryCommand(queryParams));
    
    return {
      transactions: result.Items || [],
      lastEvaluatedKey: result.LastEvaluatedKey
    };
  } catch (error) {
    logger.error('Error getting wallet transactions:', error);
    throw error;
  }
};

/**
 * Batch create multiple transactions
 * 
 * @param {Array} transactions - Array of transaction objects
 * @returns {Promise<void>}
 */
const batchCreateTransactions = async (transactions) => {
  try {
    if (!transactions || transactions.length === 0) {
      return;
    }
    
    // Process in batches of 25 (DynamoDB batch write limit)
    const batchSize = 25;
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      
      // Create individual transactions
      await Promise.all(batch.map(txn => {
        return createTransaction(
          txn.contextId,
          txn.userId,
          txn.type,
          txn.tokenName,
          txn.tokenAmount,
          txn.description,
          txn.metadata
        );
      }));
    }
  } catch (error) {
    logger.error('Error batch creating wallet transactions:', error);
    throw error;
  }
};

module.exports = {
  TRANSACTION_TYPES,
  createTransaction,
  getUserTransactions,
  batchCreateTransactions
}; 