const { 
    ReceiveMessageCommand, 
    DeleteMessageCommand,
    ChangeMessageVisibilityCommand 
} = require('@aws-sdk/client-sqs');
const { sqsClient } = require('../config/aws');
const transcribeService = require('./transcribeService.js');
const s3Service = require('./s3Service.js');
const { dynamoDB, UpdateCommand, CALLS_TABLE } = require("../config/db");

class AudioProcessingService {
    constructor() {
        this.isRunning = false;
        this.processingMessages = new Map(); // Track messages being processed
        this.SQS_QUEUE_URL = process.env.SQS_AUDIO_QUEUE_URL;
        this.VISIBILITY_TIMEOUT = 30; // seconds
        this.VISIBILITY_TIMEOUT_EXTEND = 25; // seconds to extend before timeout
    }

    async start() {
        if (this.isRunning) {
            console.log('Service is already running');
            return;
        }

        this.isRunning = true;
        console.log('📡 Audio Processing Service Started...');
        
        // Start visibility timeout extension monitor
        this.startVisibilityTimeoutMonitor();
        
        // Start polling
        await this.poll();
    }

    async stop() {
        this.isRunning = false;
        console.log('Audio Processing Service Stopping...');
        
        // Wait for all processing to complete
        const processingPromises = Array.from(this.processingMessages.values());
        await Promise.all(processingPromises);
        
        console.log('Audio Processing Service Stopped');
    }

    startVisibilityTimeoutMonitor() {
        // Periodically check and extend visibility timeout for messages still processing
        setInterval(async () => {
            for (const [receiptHandle, messageInfo] of this.processingMessages.entries()) {
                const timeInProcessing = Date.now() - messageInfo.startTime;
                
                // If message has been processing for more than VISIBILITY_TIMEOUT_EXTEND seconds
                if (timeInProcessing >= this.VISIBILITY_TIMEOUT_EXTEND * 1000) {
                    await this.extendVisibilityTimeout(receiptHandle);
                }
            }
        }, 5000); // Check every 5 seconds
    }

    async extendVisibilityTimeout(receiptHandle) {
        try {
            const command = new ChangeMessageVisibilityCommand({
                QueueUrl: this.SQS_QUEUE_URL,
                ReceiptHandle: receiptHandle,
                VisibilityTimeout: this.VISIBILITY_TIMEOUT
            });
            await sqsClient.send(command);
            console.log(`Extended visibility timeout for message: ${receiptHandle}`);
        } catch (error) {
            console.error('Error extending message visibility:', error);
        }
    }

    async poll() {
        while (this.isRunning) {
            try {
                const messages = await this.receiveMessages();
                
                // Process messages concurrently but with error handling for each
                await Promise.all(
                    messages.map(message => this.handleMessage(message))
                );

                // If no messages, wait before polling again
                if (messages.length === 0) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            } catch (error) {
                console.error('Error in polling loop:', error);
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
    }

    async receiveMessages() {
        const params = {
            QueueUrl: this.SQS_QUEUE_URL,
            MaxNumberOfMessages: 10,
            WaitTimeSeconds: 2,
            VisibilityTimeout: this.VISIBILITY_TIMEOUT,
            AttributeNames: ['All']
        };

        try {
            const command = new ReceiveMessageCommand(params);
            const { Messages } = await sqsClient.send(command);
            return Messages || [];
        } catch (error) {
            console.error('Error receiving messages:', error);
            return [];
        }
    }

    async handleMessage(message) {
        // Add message to processing tracking
        this.processingMessages.set(message.ReceiptHandle, {
            startTime: Date.now(),
            messageId: message.MessageId
        });

        try {
            await this.processMessage(message);
            await this.deleteMessage(message.ReceiptHandle);
        } catch (error) {
            console.error(`Error processing message ${message.MessageId}:`, error);
            // Don't delete the message - let it return to the queue
        } finally {
            // Remove from processing tracking
            this.processingMessages.delete(message.ReceiptHandle);
        }
    }

    async processMessage(message) {
        console.log('Processing message:', message.MessageId);
        
        try {
            const messageBody = JSON.parse(message.Body);
            
            if (!messageBody.Records || !Array.isArray(messageBody.Records)) {
                throw new Error('Invalid message format: Records array not found');
            }

            // Process all records in the message
            await Promise.all(messageBody.Records.map(async (record) => {
                const fileKey = record?.s3?.object?.key;
                
                if (!fileKey) {
                    console.error('Invalid record format: missing file key', record);
                    return; // Skip this record but continue with others
                }

                console.log(`Processing file: ${fileKey}`);

                // Get audio from S3
                const audioBuffer = await s3Service.getAudioFromS3(fileKey);
                
                // Transcribe audio
                const transcription = await transcribeService.transcribeAudio(fileKey, audioBuffer);

                // Parse user and call IDs from file key
                const [,userId , fileName] = fileKey.split('/');
                const [callId, ] = fileName.split('.');
                if (!userId || !callId) {
                    console.error(`Invalid file key format: ${fileKey}`);
                    return; // Skip this record but continue with others
                }

                // Update DynamoDB
                const updateParams = {
                    TableName: CALLS_TABLE,
                    Key: { userId, callId },
                    UpdateExpression: "SET transcription = :transcription",
                    ExpressionAttributeValues: { ":transcription": transcription },
                    ReturnValues: "UPDATED_NEW",
                };
                await dynamoDB.send(new UpdateCommand(updateParams));
                
                console.log(`Successfully processed record for file: ${fileKey}`);
            }));

            console.log(`Successfully processed all records in message: ${message.MessageId}`);
        } catch (error) {
            console.error('Error in message processing:', error);
            throw error; // Rethrow to trigger message retention
        }
    }

    async deleteMessage(receiptHandle) {
        const deleteParams = {
            QueueUrl: this.SQS_QUEUE_URL,
            ReceiptHandle: receiptHandle
        };
        
        try {
            const deleteCommand = new DeleteMessageCommand(deleteParams);
            await sqsClient.send(deleteCommand);
            console.log('Successfully deleted message from queue');
        } catch (error) {
            console.error('Error deleting message:', error);
            throw error; // Rethrow to ensure we know if deletions are failing
        }
    }
}

// Create and export a singleton instance
const audioProcessingService = new AudioProcessingService();
module.exports = audioProcessingService; 