const { DynamoDB } = require('@aws-sdk/client-dynamodb');
const { REGION } = require('../config/aws');

const dynamoDB = new DynamoDB({ region: REGION });

const params = {
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

const createTable = async () => {
  try {
    const result = await dynamoDB.createTable(params);
    console.log('Table created successfully:', result);
  } catch (error) {
    console.error('Error creating table:', error);
  }
};

createTable(); 