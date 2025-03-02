const callService = require('../services/callService');
const logger = require('../utils/logger');
const templateService = require('../services/templateService');
const aiService = require('../services/aiService');

const getCalls = async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 10;
    const { nextToken } = req.query;
    
    // Validate limit
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be a number between 1 and 100'
      });
    }

    // Get paginated results
    const result = await callService.getCallsByUserId(userId, limit, nextToken);
    
    res.json({
      success: true,
      data: result.items,
      nextToken: result.nextToken
    });
  } catch (error) {
    logger.error('Error retrieving calls: ', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving calls',
      error: error.message
    });
  }
};

const processCall = async (req, res) => {
  const MAX_POLL_TIME = 30000; // 30 seconds max
  const DEFAULT_POLL_INTERVAL = 2000; // 2 seconds
  
  try {
    const { callId } = req.params;
    const { templateName, contextId, pollInterval = DEFAULT_POLL_INTERVAL, timeout = MAX_POLL_TIME } = req.query;
    const userId = req.user.userId;

    // Validate input
    if (!templateName || !contextId) {
      return res.status(400).json({
        success: false,
        message: 'templateName and contextId are required'
      });
    }

    const startTime = Date.now();
    let call;

    // Long polling loop
    while (Date.now() - startTime < timeout) {
      // Get call details
      call = await callService.getCallByUserIdAndCallId(userId, callId);
      
      if (!call) {
        return res.status(404).json({ success: false, message: 'Call not found' });
      }

      if (call.transcription) {
        // Transcription available - proceed to process
        const template = await templateService.getTemplate(contextId, templateName);
        if (!template) {
          return res.status(404).json({ success: false, message: 'Template not found' });
        }

        const result = await aiService.processWithTemplate(call.transcription, template);
        
        // Store processing result in call table
        const processingResult = result.choices[0].message.content;
        await callService.updateCallTemplates(
          userId, 
          callId,
          templateName,
          processingResult
        );

        // Get updated call object
        const updatedCall = await callService.getCallByUserIdAndCallId(userId, callId);

        return res.json({
          success: true,
          data: updatedCall
        });
      }

      // Wait for the poll interval or remaining time
      const remainingTime = timeout - (Date.now() - startTime);
      await new Promise(resolve => 
        setTimeout(resolve, Math.min(pollInterval, remainingTime))
      );
    }

    // Timeout reached
    res.status(408).json({
      success: false,
      message: 'Transcription not available within timeout period'
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
