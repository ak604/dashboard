const axios = require("axios");
const FormData = require ("form-data");
const GROQ_TRANSCRIBE_URL = process.env.GROQ_TRANSCRIBE_URL;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Transcribe audio with Groq API
const transcribeAudio = async (audioFileName, audioBuffer) => {
    try{
        const form = new FormData();
        form.append('file', audioBuffer, audioFileName); // send the file (name + content)
        form.append('model',"distil-whisper-large-v3-en");
        form.append('language',  "en");
        form.append('response_format',  "json");
        form.append('temperature', 0.0);
        const transcriptionResponse = await axios.post(GROQ_TRANSCRIBE_URL, form, {
            headers: {
              ...form.getHeaders(),
              'Authorization': `Bearer ${GROQ_API_KEY}`
            }
          });
          return transcriptionResponse.data.text ;
    }catch(error){
        console.log("error while calling transcribe api")
        throw error;
    }
};

module.exports = { transcribeAudio };
