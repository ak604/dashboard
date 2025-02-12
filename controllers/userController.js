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
      const user = await userService.getUser(req.params.userId);
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

module.exports = { createUser, getUser };