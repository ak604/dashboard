const { ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');
const { Observable } = require('rxjs');
const { mergeMap, retry, catchError } = require('rxjs/operators');
const {sqsClient }= require('../config/aws');

const receiveMessages = async () => {
  const params = {
    QueueUrl: process.env.SQS_AUDIO_QUEUE_URL,
    MaxNumberOfMessages: 10,
    WaitTimeSeconds: 10, // Long polling
    VisibilityTimeout: 30, // Time to process before message becomes visible again
  };

  try {
    const command = new ReceiveMessageCommand(params);
    const { Messages } = await sqsClient.send(command);
    return Messages || [];
  } catch (error) {
    console.error('❌ Error receiving messages:', error);
    return [];
  }
};


// Reactive SQS Message Stream
const sqsMessageStream = new Observable((subscriber) => {
  console.log('📡 SQS Reactive Listener Started...');

  const pollQueue = async () => {
    while (true) {
      const messages = await receiveMessages();
      messages.forEach((message) => subscriber.next(message));

      // Prevent aggressive looping when there are no messages
      if (messages.length === 0) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  };

  pollQueue();
}).pipe(
  mergeMap(async (message) => {
    console.log('📩 Processing message:', message.Body);
    
    // Simulate business logic (e.g., save to DB)
    await new Promise((resolve) => setTimeout(resolve, 500)); 
    
    await deleteMessage(message.ReceiptHandle);
    return message;
  }),
  retry({ count: 5, delay: 3000 }), // Automatic retry on failure
  catchError((error) => {
    console.error('🚨 Stream error:', error);
    return [];
  })
);

module.exports = sqsMessageStream;
