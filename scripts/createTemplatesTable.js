const { DynamoDB } = require('@aws-sdk/client-dynamodb');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Set up AWS connection
const REGION = process.env.AWS_REGION || 'us-east-1';
const dynamoDB = new DynamoDB({ 
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Templates table definition
const tableDefinition = {
  TableName: 'Templates',
  KeySchema: [
    { AttributeName: 'contextId', KeyType: 'HASH' },  // Partition key
    { AttributeName: 'templateName', KeyType: 'RANGE' }  // Sort key
  ],
  AttributeDefinitions: [
    { AttributeName: 'contextId', AttributeType: 'S' },
    { AttributeName: 'templateName', AttributeType: 'S' }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  }
};

// Create the Templates table
const createTemplatesTable = async () => {
  try {
    console.log('Creating Templates table...');
    await dynamoDB.createTable(tableDefinition);
    console.log('Templates table created successfully!');
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log('Templates table already exists.');
    } else {
      console.error('Error creating Templates table:', error);
      throw error;
    }
  }
};

// If this script is run directly
if (require.main === module) {
  createTemplatesTable()
    .then(() => console.log('Templates table creation complete!'))
    .catch(err => {
      console.error('Failed to create Templates table:', err);
      process.exit(1);
    });
}

module.exports = { createTemplatesTable }; 