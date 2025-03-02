const groq = require('groq');
const logger = require('../utils/logger');

class GroqService {
  constructor() {
    this.client = groq(process.env.GROQ_API_KEY);
  }

  /**
   * Process text with a template using Groq
   * @param {string} text - The text to process (transcription)
   * @param {Object} template - The template object with system and user content
   * @returns {Promise<Object>} - Groq completion response
   */
  async processWithTemplate(text, template) {
    try {
      // Replace placeholder in user content if present
      const userContent = template.userContent.replace('{{transcription}}', text);

      const completion = await this.client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: template.systemContent
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
    } catch (error) {
      logger.error('Error processing with Groq:', error);
      throw new Error(`Groq API error: ${error.message}`);
    }
  }
}

module.exports = new GroqService();