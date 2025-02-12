const { dynamoDB, PutCommand, GetCommand, QueryCommand, USERS_TABLE } = require('../config/db');
const companyService = require("../services/companyService");
const { v4: uuidv4 } = require("uuid");

const createUser = async ( email, name, phoneNumber, designation, accessLevel, companyId, supervisorId) => {
    const userId = uuidv4();
    const existingUser = await getUserByPhone(phoneNumber);
    if (existingUser && existingUser.length > 0){
        throw new Error("user with phoneNumber already present");
    }

    const user = { userId, name, email, phoneNumber, designation, accessLevel,companyId, createdAt: new Date().toISOString() };

    await companyService.addUserToCompany(companyId, supervisorId, userId, name);
    const params = new PutCommand({
      TableName: USERS_TABLE,
      Item: user,
    });
    await dynamoDB.send(params);
    return userId;
};


const getUser = async (userId) => {
  const params = {
    TableName: USERS_TABLE,
    Key: { userId: userId },
  };
  const result = await dynamoDB.send(new GetCommand(params)); // Use `send` with the new SDK
  console.log("Query Result:", result.Item);
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
  return data.Items;
};

module.exports = {createUser, getUser, getUserByPhone};
