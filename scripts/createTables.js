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
        TableName: "Companies",
        KeySchema: [{ AttributeName: "companyId", KeyType: "HASH" }], // Primary Key
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
                KeySchema: [{ AttributeName: "phoneNumber", KeyType: "HASH" }], // Partition Key for GSI
                Projection: { ProjectionType: "ALL" }, // Include all attributes
                ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 }
            }
        ]
    },
    {
        TableName: "Users",
        KeySchema: [
            { AttributeName: "companyId", KeyType: "HASH" },  // Partition Key
            { AttributeName: "userId", KeyType: "RANGE" }  // Sort Key
        ],
        AttributeDefinitions: [
            { AttributeName: "userId", AttributeType: "S" },
            { AttributeName: "companyId", AttributeType: "S" },
            { AttributeName: "phoneNumber", AttributeType: "S" } 
        ],
        ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
    
        // ✅ Global Secondary Index (GSI) on companyId
        GlobalSecondaryIndexes: [
            {
                IndexName: "UserPhoneIndex",
                KeySchema: [{ AttributeName: "phoneNumber", KeyType: "HASH" }], // Partition Key for GSI
                Projection: { ProjectionType: "ALL" }, // Include all attributes
                ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 }
            }
        ]
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
            { AttributeName: "companyId", AttributeType: "S" } // Required for GSI
        ],
        ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
    
        // ✅ Global Secondary Index (GSI) on companyId
        GlobalSecondaryIndexes: [
            {
                IndexName: "CompanyIndex",
                KeySchema: [{ AttributeName: "companyId", KeyType: "HASH" }], // Partition Key for GSI
                Projection: { ProjectionType: "ALL" }, // Include all attributes
                ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 }
            }
        ]
    }]

// 📌 Create all tables
const createAllTables = async () => {
    for (let table of tables) {
        await createTable(table);
    }
};

// 📌 Run the function to create the tables
createAllTables();
