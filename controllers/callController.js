const callService = require('../services/callService');
const logger = require('../utils/logger');
const templateService = require('../services/templateService');
const aiService = require('../services/aiService');
const s3Service = require('../services/s3Service');

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

const deleteCall = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { callId } = req.params;

    if (!callId) {
      return res.status(400).json({
        success: false,
        message: 'Call ID is required'
      });
    }

    // Check if the call exists first
    const call = await callService.getCallByUserIdAndCallId(userId, callId);
    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found or you do not have permission to delete it'
      });
    }

    // Delete the call from DynamoDB
    await callService.deleteCall(userId, callId);
    
    // Delete the audio file from S3
    try {
      if (call.fileName) {
        const s3Key = `${call.contextId}/${userId}/${call.fileName}`;
        await s3Service.deleteFileFromS3(process.env.AUDIO_BUCKET, s3Key);
      }
    } catch (s3Error) {
      // Log the error but don't fail the whole operation if S3 delete fails
      console.error('Warning: Could not delete S3 file:', s3Error);
      // Continue with the response, as the DB record was successfully deleted
    }

    res.json({
      success: true,
      message: 'Call deleted successfully',
      data: { callId }
    });
  } catch (error) {
    console.error('Error deleting call:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting call',
      error: error.message
    });
  }
};

module.exports = { getCalls, processCall, deleteCall };
