const { dynamoDB, PutCommand, GetCommand, QueryCommand, USERS_TABLE } = require('../config/db');
const companyService = require("../services/companyService");
const { v4: uuidv4 } = require("uuid");

const createUser = async (email, name, phoneNumber, designation, accessLevel, contextId, supervisorId) => {
    const userId = uuidv4();
    const existingUser = await getUserByPhone(phoneNumber);
    if (existingUser) {
        throw new Error("User with phoneNumber already exists");
    }

    const user = {
        userId,
        contextId,  // This can be either appId or companyId
        name,
        email,
        phoneNumber,
        designation,
        accessLevel,
        createdAt: new Date().toISOString()
    };

    // Only add to company org tree if contextId is a companyId
    if (contextId.startsWith('comp_')) {  // Assuming we use prefixes to distinguish
        await companyService.addUserToCompany(contextId, supervisorId, userId, name);
    }

    const params = new PutCommand({
        TableName: USERS_TABLE,
        Item: user
    });

    await dynamoDB.send(params);
    return userId;
};

const getUser = async (contextId, userId) => {
    const params = {
        TableName: USERS_TABLE,
        Key: { contextId, userId }
    };

    const result = await dynamoDB.send(new GetCommand(params));
    return result.Item;
};

const getUserByPhone = async (phoneNumber) => {
    const params = {
        TableName: USERS_TABLE,
        IndexName: "UserPhoneIndex", 
        KeyConditionExpression: "phoneNumber = :phoneNumber",
        ExpressionAttributeValues: {
            ":phoneNumber": phoneNumber,
        },
    };
    const data = await dynamoDB.send(new QueryCommand(params));
    console.log("Query Result:", data.Items);
    return data?.Items[0];
};

const updateUser = async (user) => {
    const params = new PutCommand({
        TableName: USERS_TABLE,
        Item: user,
    });
    await dynamoDB.send(params);
};

const getUsersByCompany = async (companyId) => {
    const params = {
        TableName: USERS_TABLE,
        KeyConditionExpression: "companyId = :companyId",
        ExpressionAttributeValues: {
            ":companyId": companyId
        }
    };

    try {
        const data = await docClient.send(new QueryCommand(params));
        console.log("Users:", data.Items);
        return data.Items;
    } catch (err) {
        console.error("Error", err);
    }
};

const getUserByEmail = async (email) => {
    const params = {
        TableName: USERS_TABLE,
        IndexName: "UserEmailIndex", // You'll need to add this GSI
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: {
            ":email": email
        }
    };
    
    const result = await dynamoDB.send(new QueryCommand(params));
    return result.Items[0];
};

const createUserWithGoogle = async (userData, contextId) => {
    const userId = uuidv4();
    const user = {
        userId,
        contextId,
        email: userData.email,
        name: userData.name,
        googleId: userData.googleId,
        picture: userData.picture,
        accessLevel: userData.accessLevel,
        createdAt: new Date().toISOString()
    };

    const params = new PutCommand({
        TableName: USERS_TABLE,
        Item: user
    });

    await dynamoDB.send(params);
    return user;
};

module.exports = {
    createUser,
    getUser,
    getUserByPhone,
    updateUser,
    getUsersByCompany,
    getUserByEmail,
    createUserWithGoogle
};
