const { Groq } = require('groq-sdk');
const logger = require('../utils/logger');

class AIService {
  constructor() {
   
    // Initialize Groq client
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  /**
   * Process text with a template using AI
   * @param {string} text - The text to process (transcription)
   * @param {Object} template - The template object with system and user content
   * @returns {Promise<Object>} - AI completion response
   */
  async processWithTemplate(text, template) {
    try {
      // Replace placeholder in user content if present
      const userContent = template.userContent.replace('{{transcription}}', text);
      return await this.processWithGroq(template.systemContent, userContent, template);
    
    } catch (error) {
      logger.error('Error processing with AI:', error);
      throw new Error(`AI API error: ${error.message}`);
    }
  }

 
  /**
   * Process with Groq
   */
  async processWithGroq(systemContent, userContent, template) {
    const completion = await this.groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemContent
        },
        {
          role: 'user',
          content: userContent
        }
      ],
      model: template.model || 'llama3-70b-8192',
      temperature: template.temperature || 0.7,
      max_tokens: template.max_completion_tokens || 1000
    });

    return completion;
  }

}

module.exports = new AIService(); 