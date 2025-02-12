// services/companyService.js
const { dynamoDB, PutCommand, GetCommand, QueryCommand, UpdateCommand, COMPANIES_TABLE } = require('../config/db');
const { v4: uuidv4 } = require("uuid");

const createCompany = async ( name, email, phoneNumber, industry) => {

  const existingCompany = await getCompanyByPhone(phoneNumber);
      if (existingCompany && existingCompany.length > 0){
          throw new Error("company with phoneNumber already present");
      }
  
  const companyId = uuidv4();
  const params = {
    TableName: COMPANIES_TABLE,
    Item: {
      companyId: companyId,
      name: name,
      email: email,
      phoneNumber: phoneNumber,
      industry: industry,
      createdAt: new Date().toISOString(),
    }
  };
  await dynamoDB.send(new PutCommand(params)); 
  return companyId
};

const getCompany = async (companyId) => {
  const params = {
    TableName: COMPANIES_TABLE,
    Key: { companyId: companyId },
  };

  const result = await dynamoDB.send(new GetCommand(params)); // Use `send` with the new SDK
  return result.Item;
};

const findParentNode = (root, parentUserId) => {
  if (!root) return null;
  
  // If the current node is the parent, return its children object
  if (root.userId == parentUserId) {
    return root;
  }

  // Recursively search in all children
  for (const child in root.childNodes) {
    const found = findParentNode(child, parentUserId);
    if (found) return found;
  }

  return null;
};


const addUserToCompany = async (companyId, parentUserId, newUserId, name) => {
  // Fetch existing users tree
  const getParams = {
    TableName: COMPANIES_TABLE,
    Key: { companyId },
  };

  try {
    const company = await getCompany(companyId);
    if (!company){
      throw new Error('Company not found');
    }
    const orgTree = company.orgTree   || {childNodes :[], userId: companyId, name : company.name};

    const parentNode = findParentNode(orgTree, parentUserId);
    if (!parentNode) {
      throw new Error(`Parent user '${parentUserId}' not found in company '${companyId}'`);
    }
    
    const newNode = {childNodes :[], userId: newUserId, name : name};  
    parentNode.childNodes.push(newNode);

    const updateParams = {
      TableName: COMPANIES_TABLE,
      Key: { companyId },
      UpdateExpression: "SET orgTree = :orgTree",
      ExpressionAttributeValues: { ":orgTree": orgTree },
      ReturnValues: "UPDATED_NEW",
    };

    const result = await dynamoDB.send(new UpdateCommand(updateParams));
    console.log("Updated Tree Structure:", result.Attributes);
    return result.Attributes;
  } catch (error) {
      console.error("Error updating org tree:", error);
      throw error;
  }
};

const getCompanyByPhone = async (phoneNumber) => {
  const params = {
    TableName: COMPANIES_TABLE,
    IndexName: "CompanyPhoneIndex", 
    KeyConditionExpression: "phoneNumber = :phoneNumber",
    ExpressionAttributeValues: {
      ":phoneNumber": phoneNumber,
    },
  };
  const data = await dynamoDB.send(new QueryCommand(params));
  console.log("Query Result:", data.Items);
  return data.Items;
};

module.exports = { createCompany, getCompany, addUserToCompany };

