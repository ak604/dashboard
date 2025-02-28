const { dynamoDB, PutCommand, GetCommand, QueryCommand, APPS_TABLE } = require('../config/db');
const { v4: uuidv4 } = require("uuid");

const createApp = async (packageId, name, description = '') => {
    const appId = uuidv4();
    const app = {
        appId,
        packageId,
        name,
        description,
        createdAt: new Date().toISOString()
    };

    const params = new PutCommand({
        TableName: APPS_TABLE,
        Item: app
    });

    await dynamoDB.send(params);
    return appId;
};

const getApp = async (appId) => {
    const params = {
        TableName: APPS_TABLE,
        Key: { appId }
    };

    const result = await dynamoDB.send(new GetCommand(params));
    return result.Item;
};

const getAppByPackageId = async (packageId) => {
    const params = {
        TableName: APPS_TABLE,
        IndexName: "PackageIdIndex",
        KeyConditionExpression: "packageId = :packageId",
        ExpressionAttributeValues: {
            ":packageId": packageId
        }
    };

    const result = await dynamoDB.send(new QueryCommand(params));
    return result.Items[0];
};

module.exports = {
    createApp,
    getApp,
    getAppByPackageId
}; 