const { dynamoDB, QueryCommand, GetCommand, CALLS_TABLE } = require('../config/db');

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

const getCallByUserIdAndCallId = async (userId, callId) => {
  const params = {
    TableName: CALLS_TABLE,
    Key: {
      userId: userId,
      callId: callId
    }
  };

  const result = await dynamoDB.send(new GetCommand(params));
  return result.Item;
};

module.exports = { getCallsByUserId, getCallByUserIdAndCallId };
