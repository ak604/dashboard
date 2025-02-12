// controllers/callController.js
const callService = require('../services/callService');
const logger = require('../utils/logger');

const logCall = async (req, res) => {
  try {
    const { callId, agentId, companyId, callStartTime, callEndTime, duration, callType, outcome } = req.body;
    await callService.logCall(callId, agentId, companyId, callStartTime, callEndTime, duration, callType, outcome);
    res.status(201).send({ message: 'Call logged successfully' });
  } catch (error) {
    logger.error('Error logging call: ', error);
    res.status(500).send({ message: 'Error logging call', error });
  }
};

const getCallsByAgent = async (req, res) => {
  try {
    const calls = await callService.getCallsByAgent(req.params.agentId);
    res.status(200).send(calls);
  } catch (error) {
    logger.error('Error retrieving call logs: ', error);
    res.status(500).send({ message: 'Error retrieving call logs', error });
  }
};

module.exports = { logCall, getCallsByAgent };
