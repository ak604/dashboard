const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const {s3Client,  PutObjectCommand, GetObjectCommand} = require("../config/aws");
const {dynamoDBClient, PutCommand, CALLS_TABLE} = require("../config/db");
const { v4: uuidv4 } = require('uuid');
const callService = require("../services/callService");
const appService = require("../services/appService");
const userService = require("../services/userService");
const logger = require("../utils/logger");
const walletTransactionService = require('../services/walletTransactionService');

const generatePreSignedUrl = async (req, res) => {
    try {
        const fileName = req.body.fileName;
        const fileType = req.body.fileType;
        const contextId = req.body.contextId;
        const userId = req.user.userId;
        
        // Duration in seconds, if provided
        const duration = req.body.duration !== undefined ? Number(req.body.duration) : null;
        
        // Check for required fields
        if (!fileName || !fileType) {
            return res.status(400).json({ error: "Missing required parameters" });
        }
        
        // Process payment for audio duration if applicable
        let paymentInfo = null;
        
        if (duration !== null && contextId.startsWith('app_')) {
            try {
                // Get cost for the "audio_upload" task
                const cost = await appService.getCostForTask(contextId, "audio_upload", duration);
                
                // Deduct from user wallet
                await userService.deductFromUserWallet(contextId, userId, cost.tokenName, cost.tokenAmount);
                
                // Record the transaction
                await walletTransactionService.createTransaction(
                    contextId,
                    userId,
                    walletTransactionService.TRANSACTION_TYPES.DEBIT,
                    cost.tokenName,
                    cost.tokenAmount,
                    `Payment for ${duration}s audio upload`,
                    {
                        fileName,
                        durationSeconds: duration,
                        source: 'audio_upload'
                    }
                );
                
                paymentInfo = {
                    tokenName: cost.tokenName,
                    tokenAmount: cost.tokenAmount,
                    durationSeconds: duration
                };
                
                logger.info(`Payment processed: ${cost.tokenAmount} ${cost.tokenName} tokens for ${duration}s audio`);
            } catch (error) {
                return res.status(402).json({ 
                    error: "Payment Required", 
                    message: error.message 
                });
            }
        }
        
        const command = new PutObjectCommand({
            Bucket: process.env.AUDIO_BUCKET,
            Key: contextId + "/" + userId + "/" + fileName,
            ContentType: fileType,
        });
       
        const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 60 });

        const [callId,] = fileName.split('.');
        const dbCommand = new PutCommand({
            TableName: CALLS_TABLE,
            Item: {
                callId: callId,  
                userId: userId,
                contextId: contextId,
                fileName: fileName,
                fileType: fileType,
                createdAt: new Date().toISOString(),
                expires_at: Math.floor(Date.now() / 1000) + 30*86400,
                ...(duration !== null && { durationSeconds: duration }),
                ...(paymentInfo !== null && { payment: paymentInfo })
            },
        });
        await dynamoDBClient.send(dbCommand);
        
        res.json({ 
            success: true,
            data: {
                uploadURL,
                callId,
                payment: paymentInfo
            }
        });
    } catch (error) {
        logger.error("Error generating presigned URL:", error);
        res.status(500).json({ 
            success: false,
            error: "Error generating presigned URL",
            message: error.message
        });
    }
};

const generateDownloadUrl = async (req, res) => {
    try {
        const { callId } = req.params;
        const userId = req.user.userId;
        
        // Verify the call exists and belongs to the user
        const call = await callService.getCallByUserIdAndCallId(userId, callId);
        
        if (!call) {
            return res.status(404).json({
                success: false,
                message: 'Call not found or you do not have permission to access it'
            });
        }
        
        if (!call.fileName) {
            return res.status(404).json({
                success: false,
                message: 'No audio file associated with this call'
            });
        }
        
        // Create the S3 key using the file information
        const fileKey = `${call.contextId}/${userId}/${call.fileName}`;
        
        // Create a GetObjectCommand to generate a download URL
        const command = new GetObjectCommand({
            Bucket: process.env.AUDIO_BUCKET,
            Key: fileKey
        });
        
        // Generate a presigned URL with 5 minute (300 seconds) expiration
        const downloadURL = await getSignedUrl(s3Client, command, { expiresIn: 300 });
        
        res.json({
            success: true,
            data: {
                downloadURL,
                fileName: call.fileName,
                fileType: call.fileType,
                callId: call.callId
            }
        });
    } catch (error) {
        console.error("Error generating download URL:", error);
        res.status(500).json({
            success: false,
            message: 'Error generating download URL',
            error: error.message
        });
    }
};

module.exports = { 
    generatePreSignedUrl,
    generateDownloadUrl
};
