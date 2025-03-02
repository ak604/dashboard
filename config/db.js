const { DynamoDBClient, CreateTableCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { credential, awsRegion } = require("../config/credentials");

const dynamoDBClient = new DynamoDBClient({
  region: awsRegion,
  credentials: credential
});

const dynamoDB = DynamoDBDocumentClient.from(dynamoDBClient);;
const USERS_TABLE = process.env.USERS_TABLE || "Users";
const CALLS_TABLE = process.env.CALLS_TABLE || "Calls";
const COMPANIES_TABLE = process.env.COMPANIES_TABLE || "Companies";
const APPS_TABLE = process.env.APPS_TABLE || "Apps";
const TEMPLATES_TABLE = 'Templates';

module.exports = { dynamoDB, dynamoDBClient,  GetCommand, PutCommand, QueryCommand, 
    UpdateCommand, CreateTableCommand, USERS_TABLE, CALLS_TABLE, COMPANIES_TABLE, APPS_TABLE, TEMPLATES_TABLE };
