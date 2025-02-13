const {s3Client, PutObjectCommand, GetObjectCommand} = require("../config/aws");
const uploadStringToS3 = async (bucketName, fileKey, content) => {
    try {
        const params = {
            Bucket: bucketName,
            Key: fileKey,  // File name in S3
            Body: content,  // String content
            ContentType: "text/plain", // Set MIME type
        };

        const command = new PutObjectCommand(params);
        await s3Client.send(command);
        
        console.log(`File uploaded successfully: ${fileKey}`);
    } catch (error) {
        console.error("Error uploading file to S3:", error);
    }
};

// Get audio file from S3
const getAudioFromS3 = async (fileKey) => {
    const response = await s3Client.send(new GetObjectCommand({ Bucket: process.env.AUDIO_BUCKET, Key: fileKey }));
    return streamToBuffer(response.Body);
};

// Convert stream to buffer
const streamToBuffer = async (stream) => {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
};

module.exports = {uploadStringToS3, getAudioFromS3}