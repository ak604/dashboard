const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const {s3Client,  PutObjectCommand} = require("../config/aws");
const {dynamoDBClient, PutCommand, CALLS_TABLE} = require("../config/db");
const { v4: uuidv4 } = require('uuid');

const generatePreSignedUrl = async (req, res) => {
    try {
        const { fileName, fileType } = req.query;
        if (!fileName || !fileType) {
            return res.status(400).json({ error: "Missing fileName or fileType" });
        }

        const command = new PutObjectCommand({
            Bucket: process.env.AUDIO_BUCKET,
            Key: fileName,
            ContentType: fileType,
        });

        // Generate signed URL (valid for 60 seconds)
        const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 60 });
        const callId = uuidv4();
        const dbCommand = new PutCommand({
            TableName: CALLS_TABLE,
            Item: {
                callId: callId,  
                userId: req.userId,
                companyId: req.companyId,
                recordingUrl : uploadURL,
                createdAt: new Date().toISOString(),
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
