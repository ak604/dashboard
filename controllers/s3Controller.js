const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const {s3Client,  PutObjectCommand} = require("../config/aws");
const {dynamoDBClient, PutCommand, CALLS_TABLE} = require("../config/db");
const { v4: uuidv4 } = require('uuid');

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

module.exports = { generatePreSignedUrl };
