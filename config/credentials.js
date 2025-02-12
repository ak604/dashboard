const dotenv = require('dotenv');
const environment = process.env.APP_ENV || 'local';  
const { fromIni } = require('@aws-sdk/credential-provider-ini');
dotenv.config({ path: `.env.${environment}` });

var credential = undefined
if (environment == 'local'){
  credential = fromIni({ profile: process.env.PROFILE })
}

const awsRegion = process.env.AWS_REGION || 'ap-south-1';
module.exports = {credential, awsRegion};