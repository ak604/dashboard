const { snsClient, PublishCommand } = require("../config/aws");
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTP = async (phoneNumber, otp) => {
  const params = new PublishCommand({
    Message: `Your OTP is: ${otp}`,
    PhoneNumber: phoneNumber,
    MessageAttributes: {
      "AWS.SNS.SMS.SMSType": { DataType: "String", StringValue: "Transactional" }
  } });

  await snsClient.send(params);
};

module.exports = { generateOTP, sendOTP };
