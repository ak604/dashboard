const callService = require('../services/callService');
const logger = require('../utils/logger');
const templateService = require('../services/templateService');
const aiService = require('../services/aiService');

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

const processCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const { templateName, contextId } = req.query;
    const userId = req.user.userId; // From JWT

    // Validate input
    if (!templateName || !contextId) {
      return res.status(400).json({
        success: false,
        message: 'templateName and contextId are required query parameters'
      });
    }

    // Get call details
    const call = await callService.getCallByUserIdAndCallId(userId, callId);
    if (!call) {
      return res.status(404).json({ success: false, message: 'Call not found' });
    }
    if (!call.transcription) {
      return res.status(400).json({ 
        success: false, 
        message: 'Call has no transcription to process' 
      });
    }

    // Get template
    const template = await templateService.getTemplate(contextId, templateName);
    if (!template) {
      return res.status(404).json({ 
        success: false, 
        message: 'Template not found' 
      });
    }

    // Process with Groq
    const result = await aiService.processWithTemplate(
      call.transcription, 
      template
    );

    res.json({
      success: true,
      data: {
        processingResult: result.choices[0].message.content,
        modelUsed: result.model,
        tokensUsed: result.usage
      }
    });
  } catch (error) {
    console.error('Error processing call:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process call'
    });
  }
};

module.exports = { getCalls, processCall };
