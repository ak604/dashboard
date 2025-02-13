const transcribeService = require('./transcribeService.js');
const s3Service = require('./s3Service.js');
const crypto = require('crypto');
const {dynamoDB, UpdateCommand, CALLS_TABLE} = require("../config/db");

const init =() => {
};

function generateAudioBufferHash(audioBuffer) {
    const hash = crypto.createHash('sha256');
    
    // Convert Float32Array channels to a single Buffer
    let buffers = [];
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        buffers.push(Buffer.from(audioBuffer.getChannelData(i).buffer));
    }

    // Concatenate all channels
    const audioData = Buffer.concat(buffers);
    
    // Compute the hash
    hash.update(audioData);
    return hash.digest('hex');
}

const processMessage= async (message) =>{
    
    const messageBody = JSON.parse(message.Body)
    const fileKey = messageBody.Records?.[0]?.s3?.object?.key;
    const audioBuffer = await s3Service.getAudioFromS3(fileKey);
    const transcription = await transcribeService.transcribeAudio(fileKey, audioBuffer);
  //  s3Service.uploadStringToS3(process.env.AUDIO_TEXT_BUCKET, fileKey, transcription);

    const arr = fileKey.split('/');
    const userId = arr[0];
    const callId = arr[2];

    const updateParams = {
        TableName: CALLS_TABLE,
        Key: { userId, callId },
        UpdateExpression: "SET transcription = :transcription",
        ExpressionAttributeValues: { ":transcription": transcription },
        ReturnValues: "UPDATED_NEW",
      };
  
      const result = await dynamoDB.send(new UpdateCommand(updateParams));


}
module.exports = { init , processMessage};