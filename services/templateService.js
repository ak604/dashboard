const { dynamoDB, PutCommand, GetCommand, DeleteCommand, QueryCommand, UpdateCommand, TEMPLATES_TABLE } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Create a new template
const createTemplate = async (templateData) => {
  const timestamp = new Date().toISOString();
  
  const item = {
    contextId: templateData.contextId,
    templateName: templateData.templateName,
    systemContent: templateData.systemContent,
    userContent: templateData.userContent,
    model: templateData.model || 'gpt-4o',
    temperature: templateData.temperature || 0.7,
    max_completion_tokens: templateData.max_completion_tokens || 1000,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  const params = {
    TableName: TEMPLATES_TABLE,
    Item: item,
    // Ensure we don't overwrite an existing template with the same name
    ConditionExpression: 'attribute_not_exists(contextId) AND attribute_not_exists(templateName)'
  };

  try {
    await dynamoDB.send(new PutCommand(params));
    return item;
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      throw new Error('Template with this name already exists in this context');
    }
    throw error;
  }
};

// Get a template by contextId and templateName
const getTemplate = async (contextId, templateName) => {
  const params = {
    TableName: TEMPLATES_TABLE,
    Key: {
      contextId: contextId,
      templateName: templateName
    }
  };

  const result = await dynamoDB.send(new GetCommand(params));
  return result.Item;
};

// List all templates for a specific contextId
const listTemplatesByContextId = async (contextId) => {
  const params = {
    TableName: TEMPLATES_TABLE,
    KeyConditionExpression: 'contextId = :contextId',
    ExpressionAttributeValues: {
      ':contextId': contextId
    }
  };

  const result = await dynamoDB.send(new QueryCommand(params));
  return result.Items;
};

// Update a template
const updateTemplate = async (contextId, templateName, updates) => {
  const timestamp = new Date().toISOString();
  
  // Build the update expression and attribute values
  let updateExpression = 'SET updatedAt = :updatedAt';
  const expressionAttributeValues = {
    ':updatedAt': timestamp
  };

  // Add each field to the update expression if it exists in the updates
  const fields = ['systemContent', 'userContent', 'model', 'temperature', 'max_completion_tokens'];
  fields.forEach(field => {
    if (updates[field] !== undefined) {
      updateExpression += `, ${field} = :${field}`;
      expressionAttributeValues[`:${field}`] = updates[field];
    }
  });

  const params = {
    TableName: TEMPLATES_TABLE,
    Key: {
      contextId: contextId,
      templateName: templateName
    },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
    ConditionExpression: 'attribute_exists(contextId) AND attribute_exists(templateName)'
  };

  try {
    const result = await dynamoDB.send(new UpdateCommand(params));
    return result.Attributes;
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      throw new Error('Template not found');
    }
    throw error;
  }
};

// Delete a template
const deleteTemplate = async (contextId, templateName) => {
  const params = {
    TableName: TEMPLATES_TABLE,
    Key: {
      contextId: contextId,
      templateName: templateName
    },
    ReturnValues: 'ALL_OLD'
  };

  const result = await dynamoDB.send(new DeleteCommand(params));
  return result.Attributes;
};

module.exports = {
  createTemplate,
  getTemplate,
  listTemplatesByContextId,
  updateTemplate,
  deleteTemplate
}; 