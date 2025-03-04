const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const {s3Client,  PutObjectCommand, GetObjectCommand} = require("../config/aws");
const {dynamoDBClient, PutCommand, CALLS_TABLE} = require("../config/db");
const { v4: uuidv4 } = require('uuid');
const callService = require("../services/callService");

const generatePreSignedUrl = async (req, res) => {
    try {
        const { fileName, fileType, durationSeconds } = req.query;
        if (!fileName || !fileType) {
            return res.status(400).json({ error: "Missing fileName or fileType" });
        }
        
        // Parse durationSeconds as a number if provided
        const duration = durationSeconds ? parseFloat(durationSeconds) : null;
        
        const contextId= req.user.contextId;
        const userId = req.user.userId;
        const command = new PutObjectCommand({
            Bucket: process.env.AUDIO_BUCKET,
            Key: contextId + "/" + userId + "/" + fileName ,
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
                fileName : fileName,
                fileType : fileType,
                createdAt: new Date().toISOString(),
                expires_at: Math.floor(Date.now() / 1000) + 30*86400 ,
                ...(duration !== null && { durationSeconds: duration })
            },
        });
        await dynamoDBClient.send(dbCommand);
        
        res.json({ uploadURL, fileName });
    } catch (error) {
        console.error("Error generating pre-signed URL:", error);
        res.status(500).json({ error: "Internal Server Error" });
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
