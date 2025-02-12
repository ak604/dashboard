// services/callService.js
const { dynamoDB, PutCommand, QueryCommand } = require('../config/db');

const logCall = async (callId, agentId, companyId, callStartTime, callEndTime, duration, callType, outcome) => {
  const params = {
    TableName: 'CallLogs',
    Item: {
      call_id: callId,
      agent_id: agentId,
      company_id: companyId,
      call_start_time: callStartTime,
      call_end_time: callEndTime,
      duration_seconds: duration,
      call_type: callType,
      outcome: outcome,
      created_at: new Date().toISOString(),
    }
  };

  await dynamoDB.send(new PutCommand(params)); // Use `send` with the new SDK
};

const getCallsByAgent = async (agentId) => {
  const params = {
    TableName: 'CallLogs',
    IndexName: 'AgentIdIndex', // Ensure you have this GSI
    KeyConditionExpression: 'agent_id = :agentId',
    ExpressionAttributeValues: {
      ':agentId': agentId
    }
  };

  const result = await dynamoDB.send(new QueryCommand(params)); // Use `send` with the new SDK
  return result.Items;
};

module.exports = { logCall, getCallsByAgent };
