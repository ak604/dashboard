const callService = require('../services/callService');
const logger = require('../utils/logger');

const getCallsByUserId = async (req, res) => {
  try {
    const calls = await callService.getCallsByUserId(req.params.userId);
    res.status(200).send(calls);
  } catch (error) {
    logger.error('Error retrieving call logs: ', error);
    res.status(500).send({ message: 'Error retrieving call logs', error });
  }
};

module.exports = { getCallsByUserId };
