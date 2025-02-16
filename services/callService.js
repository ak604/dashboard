
const { dynamoDB, QueryCommand, CALLS_TABLE } = require('../config/db');

const getCallsByUserId = async (userId) => {
  const params = {
    TableName: CALLS_TABLE,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  };

  const result = await dynamoDB.send(new QueryCommand(params));
  return result.Items;
};

module.exports = { getCallsByUserId };
