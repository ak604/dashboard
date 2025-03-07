const { dynamoDBClient, CreateTableCommand } = require('../config/db');

// 📌 Function to create a DynamoDB table
const createTable = async (params) => {
    try {
        const command = new CreateTableCommand(params);
        const data = await dynamoDBClient.send(command);
        console.log(`✅ Table Created: ${params.TableName}`);
    } catch (error) {
        if (error.name === "ResourceInUseException") {
            console.log(`⚠️ Table ${params.TableName} already exists.`);
        } else {
            console.error(`❌ Error creating table ${params.TableName}:`, error);
        }
    }
};

// 📌 Define Tables
const tables = [
    {
        TableName: "Apps",
        KeySchema: [
            { AttributeName: "appId", KeyType: "HASH" }  // Primary Key
        ],
        AttributeDefinitions: [
            { AttributeName: "appId", AttributeType: "S" },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
        }
    },
    {
        TableName: "Companies",
        KeySchema: [{ AttributeName: "companyId", KeyType: "HASH" }],
        AttributeDefinitions: [
            { AttributeName: "companyId", AttributeType: "S" },
            { AttributeName: "phoneNumber", AttributeType: "S" }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
        },
        GlobalSecondaryIndexes: [
            {
                IndexName: "CompanyPhoneIndex",
                KeySchema: [{ AttributeName: "phoneNumber", KeyType: "HASH" }],
                Projection: { ProjectionType: "ALL" },
                ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 }
            }
        ]
    },
    {
        TableName: "Users",
        KeySchema: [
            { AttributeName: "contextId", KeyType: "HASH" },  // Changed from companyId
            { AttributeName: "userId", KeyType: "RANGE" }
        ],
        AttributeDefinitions: [
            { AttributeName: "userId", AttributeType: "S" },
            { AttributeName: "contextId", AttributeType: "S" },  // Changed from companyId
            { AttributeName: "email", AttributeType: "S" },
            { AttributeName: "phoneNumber", AttributeType: "S" }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: "UserPhoneIndex",
                KeySchema: [{ AttributeName: "phoneNumber", KeyType: "HASH" }],
                Projection: { ProjectionType: "ALL" },
                ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 }
            },
            {
                IndexName: "UserEmailIndex",
                KeySchema: [{ AttributeName: "email", KeyType: "HASH" }],
                Projection: { ProjectionType: "ALL" },
                ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 }
            }
        ],
        ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 }
    },
    {
        TableName: "Calls",
        KeySchema: [
            { AttributeName: "userId", KeyType: "HASH" },  // Partition Key
            { AttributeName: "callId", KeyType: "RANGE" }  // Sort Key
        ],
        AttributeDefinitions: [
            { AttributeName: "userId", AttributeType: "S" },
            { AttributeName: "callId", AttributeType: "S" },
            { AttributeName: "contextId", AttributeType: "S" } // Required for GSI
        ],
        ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
    
        // ✅ Global Secondary Index (GSI) on companyId
        GlobalSecondaryIndexes: [
            {
                IndexName: "ContextIdIndex",
                KeySchema: [{ AttributeName: "contextId", KeyType: "HASH" }], // Partition Key for GSI
                Projection: { ProjectionType: "ALL" }, // Include all attributes
                ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 }
            }
        ]
    },
    {
        TableName: 'Templates',
        KeySchema: [
          { AttributeName: 'contextId', KeyType: 'HASH' },
          { AttributeName: 'templateName', KeyType: 'RANGE' }
        ],
        AttributeDefinitions: [
          { AttributeName: 'contextId', AttributeType: 'S' },
          { AttributeName: 'templateName', AttributeType: 'S' }
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }]

// 📌 Create all tables
const createAllTables = async () => {
    for (let table of tables) {
        await createTable(table);
    }
};

// Create Rewards table
const createRewardsTable = async () => {
  try {
    const params = {
      TableName: 'Rewards',
      KeySchema: [
        { AttributeName: 'contextId', KeyType: 'HASH' }, // Partition key
        { AttributeName: 'rewardId', KeyType: 'RANGE' }  // Sort key
      ],
      AttributeDefinitions: [
        { AttributeName: 'contextId', AttributeType: 'S' },
        { AttributeName: 'rewardId', AttributeType: 'S' }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    };

    await createTable(params);
    return true;
  } catch (error) {
    console.error('Error creating Rewards table:', error);
    return false;
  }
};

// Add to the main function
const createTables = async () => {
  try {
    // ... existing tables
    await createRewardsTable();
    // ... 
    console.log('All tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};

createAllTables();
createTables();
