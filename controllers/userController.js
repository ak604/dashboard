const userService = require("../services/userService");
const logger = require('../utils/logger');

const createUser = async (req, res) => {
  try {
    const { email, name, phoneNumber, designation, accessLevel, companyId, supervisorId} = req.body;

    if (!email || !name || !phoneNumber|| !designation || !accessLevel || !companyId|| !supervisorId)
      return res.status(400).json({ message: "Missing required fields" });
    const userId = await userService.createUser(email, name, phoneNumber, designation, accessLevel, companyId, supervisorId);
    res.status(201).send({ userId: userId });
  } catch (error) {
    logger.error('Error creating user: ', error);
    res.status(500).send({ message: 'Error creating user' });
  }
};

const getUser = async (req, res) => {
    try {
      const user = await userService.getUser(req.params.contextId, req.params.userId);
      if (user) {
        res.status(200).send(user);
      } else {
        res.status(404).send({ message: 'user not found' });
      }
    } catch (error) {
      logger.error('Error retrieving user: ', error);
      res.status(500).send({ message: 'Error retrieving user', error });
    }
  };

/**
 * Update a user's access level
 */
const updateUserAccessLevel = async (req, res) => {
  try {
    const { contextId, userId } = req.params;
    const { accessLevel } = req.body;
    
    // Validate input
    if (!accessLevel) {
      return res.status(400).json({
        success: false,
        message: 'accessLevel is required'
      });
    }
    
    // Validate accessLevel value
    const validAccessLevels = ['USER', 'ADMIN', 'MODERATOR'];
    if (!validAccessLevels.includes(accessLevel)) {
      return res.status(400).json({
        success: false,
        message: `Invalid accessLevel. Must be one of: ${validAccessLevels.join(', ')}`
      });
    }
    
    // Get the current user
    const user = await userService.getUser(contextId, userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update the access level
    user.accessLevel = accessLevel;
    await userService.updateUser(user);
    
    res.json({
      success: true,
      data: {
        userId,
        contextId,
        accessLevel
      }
    });
  } catch (error) {
    logger.error('Error updating user access level:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user access level',
      error: error.message
    });
  }
};

module.exports = { createUser, getUser };