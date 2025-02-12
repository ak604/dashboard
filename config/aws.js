
const { SQSClient } = require('@aws-sdk/client-sqs');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { credential, awsRegion } = require("../config/credentials");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const snsClient = new SNSClient({
  region: awsRegion,
  credentials:credential
});
 
const sqsClient = new SQSClient({
  region: awsRegion,
  credentials: credential
});
const s3Client = new S3Client({
  region: awsRegion,
  credentials: credential
});

module.exports = {s3Client, sqsClient , snsClient, PutObjectCommand, PublishCommand};
