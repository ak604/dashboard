const { dynamoDB, QueryCommand, GetCommand, UpdateCommand, CALLS_TABLE, DeleteCommand } = require('../config/db');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { s3Client, GetObjectCommand } = require("../config/aws");

const getCallsByUserId = async (userId, limit = 10, nextToken = null) => {
  try {
    const params = {
      TableName: CALLS_TABLE,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      Limit: limit,
      ScanIndexForward: false // Get newest calls first
    };

    // Only add ExclusiveStartKey if nextToken is provided and valid
    if (nextToken && nextToken.trim() !== '') {
      try {
        const decodedToken = Buffer.from(nextToken, 'base64').toString();
        const parsedToken = JSON.parse(decodedToken);
        
        // Ensure the token has the required keys before using it
        if (parsedToken && parsedToken.userId && parsedToken.callId) {
          params.ExclusiveStartKey = parsedToken;
        }
      } catch (err) {
        console.warn("Invalid pagination token:", err);
        // Continue without the ExclusiveStartKey if token is invalid
      }
    }

    const result = await dynamoDB.send(new QueryCommand(params));

    // Generate the next token only if LastEvaluatedKey exists
    const newNextToken = result.LastEvaluatedKey 
      ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
      : null;

    return {
      items: result.Items || [],
      nextToken: newNextToken
    };
  } catch (error) {
    console.error("Error retrieving calls:", error);
    throw new Error(`Failed to retrieve calls: ${error.message}`);
  }
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

const deleteCall = async (userId, callId) => {
  try {
    const params = {
      TableName: CALLS_TABLE,
      Key: {
        userId: userId,
        callId: callId
      },
      ReturnValues: "ALL_OLD"
    };

    const result = await dynamoDB.send(new DeleteCommand(params));
    
    // If no item was found to delete
    if (!result.Attributes) {
      return null;
    }
    
    return result.Attributes;
  } catch (error) {
    console.error("Error deleting call:", error);
    throw new Error(`Failed to delete call: ${error.message}`);
  }
};

const getCallDownloadUrl = async (call) => {
  if (!call || !call.fileName || !call.contextId || !call.userId) {
    throw new Error('Invalid call data for generating download URL');
  }
  
  const fileKey = `${call.contextId}/${call.userId}/${call.fileName}`;
  
  const command = new GetObjectCommand({
    Bucket: process.env.AUDIO_BUCKET,
    Key: fileKey
  });
  
  return getSignedUrl(s3Client, command, { expiresIn: 300 });
};

module.exports = { 
  getCallsByUserId, 
  getCallByUserIdAndCallId,
  updateCallTemplates,
  deleteCall,
  getCallDownloadUrl
};
