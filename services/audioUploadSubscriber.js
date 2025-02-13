const transcribeService = require('./transcribeService.js');
const s3Service = require('./s3Service.js');

const init =() => {
};

const processMessage= async (message) =>{
    
    const messageBody = JSON.parse(message.Body)
    const fileKey = messageBody.Records?.[0]?.s3?.object?.key;
    const audioBuffer = await s3Service.getAudioFromS3(fileKey);
    const text = await transcribeService.transcribeAudio(fileKey, audioBuffer);
    s3Service.uploadStringToS3(process.env.AUDIO_TEXT_BUCKET, fileKey, text);
}
module.exports = { init , processMessage};