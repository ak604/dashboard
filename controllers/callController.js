const callService = require('../services/callService');
const logger = require('../utils/logger');

const getCalls = async (req, res) => {
  try {
    // Extract userId from JWT token instead of query parameters
    const userId = req.user.userId;
    const { callId } = req.query;

    // If callId is provided, return single call
    if (callId) {
      const call = await callService.getCallByUserIdAndCallId(userId, callId);
      if (!call) {
        return res.status(404).send({ message: 'Call not found' });
      }
      return res.status(200).send(call);
    }

    // Otherwise return all calls for the user
    const calls = await callService.getCallsByUserId(userId);
    res.status(200).send(calls);

  } catch (error) {
    logger.error('Error retrieving calls: ', error);
    res.status(500).send({ message: 'Error retrieving calls', error });
  }
};

module.exports = { getCalls };
