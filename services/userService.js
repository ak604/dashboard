const { dynamoDB, PutCommand, GetCommand, QueryCommand, UpdateCommand, USERS_TABLE } = require('../config/db');
const companyService = require("../services/companyService");
const { v4: uuidv4 } = require("uuid");

const createUser = async (email, name, phoneNumber, designation, accessLevel, contextId, supervisorId) => {
    const userId = uuidv4();
    const existingUser = await getUserByPhone(phoneNumber);
    if (existingUser) {
        throw new Error("User with phoneNumber already exists");
    }

    const user = {
        userId,
        contextId,  // This can be either appId or companyId
        name,
        email,
        phoneNumber,
        designation,
        accessLevel,
        createdAt: new Date().toISOString()
    };

    // Only add to company org tree if contextId is a companyId
    if (contextId.startsWith('comp_')) {  // Assuming we use prefixes to distinguish
        await companyService.addUserToCompany(contextId, supervisorId, userId, name);
    }

    const params = new PutCommand({
        TableName: USERS_TABLE,
        Item: user
    });

    await dynamoDB.send(params);
    return userId;
};

const getUser = async (contextId, userId) => {
    const params = {
        TableName: USERS_TABLE,
        Key: { contextId, userId }
    };

    const result = await dynamoDB.send(new GetCommand(params));
    return result.Item;
};

const getUserByPhone = async (phoneNumber) => {
    const params = {
        TableName: USERS_TABLE,
        IndexName: "UserPhoneIndex", 
        KeyConditionExpression: "phoneNumber = :phoneNumber",
        ExpressionAttributeValues: {
            ":phoneNumber": phoneNumber,
        },
    };
    const data = await dynamoDB.send(new QueryCommand(params));
    console.log("Query Result:", data.Items);
    return data?.Items[0];
};

const updateUser = async (user) => {
    const params = new PutCommand({
        TableName: USERS_TABLE,
        Item: user,
    });
    await dynamoDB.send(params);
};

const getUsersByCompany = async (companyId) => {
    const params = {
        TableName: USERS_TABLE,
        KeyConditionExpression: "companyId = :companyId",
        ExpressionAttributeValues: {
            ":companyId": companyId
        }
    };

    try {
        const data = await docClient.send(new QueryCommand(params));
        console.log("Users:", data.Items);
        return data.Items;
    } catch (err) {
        console.error("Error", err);
    }
};

const getUserByEmail = async (email) => {
    const params = {
        TableName: USERS_TABLE,
        IndexName: "UserEmailIndex", // You'll need to add this GSI
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: {
            ":email": email
        }
    };
    
    const result = await dynamoDB.send(new QueryCommand(params));
    return result.Items[0];
};

const createUserWithGoogle = async (userData, contextId) => {
    const userId = uuidv4();
    const user = {
        userId,
        contextId,
        email: userData.email,
        name: userData.name,
        googleId: userData.googleId,
        picture: userData.picture,
        accessLevel: userData.accessLevel,
        createdAt: new Date().toISOString()
    };

    const params = new PutCommand({
        TableName: USERS_TABLE,
        Item: user
    });

    await dynamoDB.send(params);
    return user;
};

/**
 * Update user's wallet - add or subtract tokens
 * @param {string} contextId - Context ID
 * @param {string} userId - User ID
 * @param {Object} walletUpdate - Map of token names to amounts to update
 * @returns {Promise<Object>} Updated wallet
 */
const updateUserWallet = async (contextId, userId, walletUpdate) => {
  try {
    // Get the current user data
    const user = await getUser(contextId, userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Initialize wallet if it doesn't exist
    const currentWallet = user.wallet || {};
    
    // Update token amounts
    for (const [tokenName, amount] of Object.entries(walletUpdate)) {
      currentWallet[tokenName] = (currentWallet[tokenName] || 0) + Number(amount);
      
      // Ensure we don't have negative token amounts
      if (currentWallet[tokenName] < 0) {
        currentWallet[tokenName] = 0;
      }
    }

    // Update the user with the new wallet
    const params = {
      TableName: USERS_TABLE,
      Key: { contextId, userId },
      UpdateExpression: "SET wallet = :wallet",
      ExpressionAttributeValues: {
        ":wallet": currentWallet
      },
      ReturnValues: "UPDATED_NEW"
    };

    const result = await dynamoDB.send(new UpdateCommand(params));
    return result.Attributes.wallet;
  } catch (error) {
    console.error("Error updating user wallet:", error);
    throw error;
  }
};

/**
 * Get a user's wallet
 * @param {string} contextId - Context ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User's wallet
 */
const getUserWallet = async (contextId, userId) => {
  const user = await getUser(contextId, userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  return user.wallet || {};
};

/**
 * Deduct tokens from user wallet
 * @param {string} contextId - Context ID
 * @param {string} userId - User ID
 * @param {string} tokenName - Name of token to deduct
 * @param {number} amount - Amount to deduct
 * @returns {Promise<boolean>} Success status
 */
const deductFromUserWallet = async (contextId, userId, tokenName, amount) => {
  try {
    const wallet = await getUserWallet(contextId, userId);
    
    // Check if user has enough tokens
    const currentAmount = wallet[tokenName] || 0;
    if (currentAmount < amount) {
      throw new Error(`Insufficient ${tokenName} tokens. Required: ${amount}, Available: ${currentAmount}`);
    }
    
    // Deduct tokens
    const update = {
      [tokenName]: -amount
    };
    
    await updateUserWallet(contextId, userId, update);
    return true;
  } catch (error) {
    console.error("Error deducting from user wallet:", error);
    throw error;
  }
};

/**
 * Get all users for a specific context
 * @param {string} contextId - Context ID (app or company)
 * @returns {Promise<Array>} List of users
 */
const getUsersByContext = async (contextId) => {
  try {
    const params = {
      TableName: USERS_TABLE,
      KeyConditionExpression: 'contextId = :contextId',
      ExpressionAttributeValues: {
        ':contextId': contextId
      }
    };
    
    const result = await dynamoDB.send(new QueryCommand(params));
    return result.Items || [];
  } catch (error) {
    console.error('Error getting users by context:', error);
    throw error;
  }
};

module.exports = {
    createUser,
    getUser,
    getUserByPhone,
    updateUser,
    getUsersByCompany,
    getUserByEmail,
    createUserWithGoogle,
    updateUserWallet,
    getUserWallet,
    deductFromUserWallet,
    getUsersByContext
};
