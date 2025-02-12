const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
const { credential, awsRegion } = require("../config/credentials");

const secretsClient = new SecretsManagerClient({
  region: awsRegion,
  credentials: credential
});

const getSecret = async () => {
    const command = new GetSecretValueCommand({ SecretId: "JWT_SECRET" });
    const response = await secretsClient.send(command);
    return response.SecretString;
  };

module.exports = getSecret;
