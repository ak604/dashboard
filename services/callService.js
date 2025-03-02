const { dynamoDB, QueryCommand, GetCommand, UpdateCommand, CALLS_TABLE } = require('../config/db');

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

const updateCallTemplates = async (userId, callId, templateName, processingResult) => {
  try {
    // First, check if the item already has templates
    const getParams = {
      TableName: CALLS_TABLE,
      Key: {
        userId,
        callId
      }
    };
    
    const result = await dynamoDB.send(new GetCommand(getParams));
    const item = result.Item;
    
    // Prepare update parameters
    let updateExpression;
    let expressionAttributeValues;
    let expressionAttributeNames;
    
    if (item && item.templates) {
      // Templates map already exists, just update the specific template
      updateExpression = "SET templates.#tn = :pr";
      expressionAttributeValues = {
        ":pr": processingResult
      };
    } else {
      // Templates map doesn't exist, create it with the first template
      updateExpression = "SET templates = :templates";
      expressionAttributeValues = {
        ":templates": {
          [templateName]: processingResult
        }
      };
    }
    
    // Only add attribute names if we're using them
    if (updateExpression.includes("#tn")) {
      expressionAttributeNames = {
        "#tn": templateName
      };
    }
    
    const updateParams = {
      TableName: CALLS_TABLE,
      Key: {
        userId,
        callId
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ...(expressionAttributeNames && { ExpressionAttributeNames: expressionAttributeNames }),
      ReturnValues: "UPDATED_NEW"
    };
    
    await dynamoDB.send(new UpdateCommand(updateParams));
  } catch (error) {
    console.error("Error updating call templates:", error);
    throw new Error("Failed to update call templates");
  }
};

module.exports = { 
  getCallsByUserId, 
  getCallByUserIdAndCallId,
  updateCallTemplates
};
