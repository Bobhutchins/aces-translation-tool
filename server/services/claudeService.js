const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

// Simple logger for now
const logger = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${msg}`)
};

class ClaudeService {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.model = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';
  }

  /**
   * Generate educational context-aware system prompt
   */
  getEducationalSystemPrompt(sourceLanguage, targetLanguage, documentType = 'general') {
    const educationalContext = {
      'iep': `
        You are translating an Individualized Education Program (IEP) document. This is a legal document that outlines special education services for a student with disabilities. Maintain:
        - Legal terminology accuracy
        - Educational assessment language
        - Service delivery descriptions
        - Parent/guardian rights information
        - Connecticut state education regulations compliance
      `,
      'report_card': `
        You are translating a student report card. Maintain:
        - Grade level appropriate language
        - Academic performance descriptors
        - Behavioral observations
        - Teacher comments and recommendations
        - Standard grading terminology
      `,
      'parent_communication': `
        You are translating parent/guardian communication. Ensure:
        - Culturally sensitive language
        - Clear, accessible terminology
        - Respectful tone for family communications
        - Educational jargon explained simply
        - Action items clearly stated
      `,
      'evaluation': `
        You are translating an educational evaluation report. Maintain:
        - Psychological assessment terminology
        - Standardized test language
        - Clinical observations
        - Diagnostic criteria
        - Professional recommendations
      `,
      'general': `
        You are translating educational documents for ACES (Area Cooperative Educational Services). Maintain:
        - Professional educational terminology
        - Connecticut education system context
        - Clear, accessible language
        - Cultural sensitivity
        - Educational best practices
      `
    };

    return `You are a professional translator specializing in educational documents for ACES (Area Cooperative Educational Services), a Connecticut educational cooperative.

${educationalContext[documentType] || educationalContext.general}

Translation Guidelines:
- Maintain the original document structure and formatting
- Preserve all proper nouns, names, and addresses exactly
- Keep educational terminology consistent with Connecticut standards
- Ensure cultural appropriateness for diverse families
- Maintain professional tone appropriate for educational settings
- Preserve numerical data, dates, and measurements exactly
- Keep legal and regulatory language precise
- Use inclusive language that respects all families

Source Language: ${sourceLanguage}
Target Language: ${targetLanguage}

Provide only the translated text without additional commentary or explanations.`;
  }

  /**
   * Translate text using Claude Sonnet 4
   */
  async translateText(text, sourceLanguage, targetLanguage, documentType = 'general', options = {}) {
    try {
      // Debug logging
      logger.info(`Starting translation: ${sourceLanguage} -> ${targetLanguage}`);
      
      const systemPrompt = this.getEducationalSystemPrompt(sourceLanguage, targetLanguage, documentType);
      
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Please translate the following text from ${sourceLanguage} to ${targetLanguage}:\n\n${text}`
          }
        ],
        temperature: options.temperature || 0.3, // Lower temperature for more consistent translations
      });

      const translatedText = response.content[0].text;
      
      // Calculate confidence score based on response metadata
      const confidenceScore = this.calculateConfidenceScore(response, text, translatedText);
      
      logger.info(`Translation completed: ${sourceLanguage} -> ${targetLanguage}, confidence: ${(confidenceScore * 100).toFixed(1)}%`);
      
      return {
        translatedText,
        confidenceScore,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens
        },
        model: this.model,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Claude translation error:', error);
      throw new Error(`Translation failed: ${error.message}`);
    }
  }

  /**
   * Calculate confidence score for translation quality
   */
  calculateConfidenceScore(response, originalText, translatedText) {
    let score = 0.85; // Base confidence score for Claude Sonnet 4
    
    // Adjust based on text length (shorter texts are more reliable)
    const textLength = originalText.length;
    if (textLength < 50) score += 0.1;
    else if (textLength < 200) score += 0.05;
    else if (textLength > 2000) score -= 0.1;
    else if (textLength > 5000) score -= 0.15;
    
    // Adjust based on translation efficiency (good translations maintain reasonable length ratio)
    const efficiency = translatedText.length / originalText.length;
    if (efficiency > 0.7 && efficiency < 1.5) score += 0.05;
    else if (efficiency < 0.3 || efficiency > 3.0) score -= 0.1;
    
    // Adjust based on response metadata
    if (response.stop_reason === 'end_turn') score += 0.05;
    
    // Adjust based on token usage (efficient usage suggests good translation)
    const inputTokens = response.usage?.input_tokens || 0;
    const outputTokens = response.usage?.output_tokens || 0;
    if (inputTokens > 0 && outputTokens > 0) {
      const tokenEfficiency = outputTokens / inputTokens;
      if (tokenEfficiency > 0.1 && tokenEfficiency < 0.8) score += 0.05;
    }
    
    // Adjust based on text complexity (simple educational documents are more reliable)
    const wordCount = originalText.split(/\s+/).length;
    if (wordCount < 100) score += 0.05;
    else if (wordCount > 1000) score -= 0.05;
    
    // Ensure score is within reasonable bounds
    return Math.min(Math.max(score, 0.6), 0.98); // Clamp between 60% and 98%
  }

  /**
   * Batch translate multiple texts
   */
  async batchTranslate(texts, sourceLanguage, targetLanguage, documentType = 'general') {
    const results = [];
    
    for (let i = 0; i < texts.length; i++) {
      try {
        const result = await this.translateText(
          texts[i], 
          sourceLanguage, 
          targetLanguage, 
          documentType
        );
        results.push({
          index: i,
          success: true,
          ...result
        });
      } catch (error) {
        results.push({
          index: i,
          success: false,
          error: error.message,
          originalText: texts[i]
        });
      }
      
      // Add small delay to respect rate limits
      if (i < texts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    return {
      'en': 'English',
      'es': 'Spanish',
      'pt': 'Portuguese',
      'fr': 'French',
      'it': 'Italian',
      'de': 'German',
      'ru': 'Russian',
      'zh': 'Chinese (Simplified)',
      'zh-TW': 'Chinese (Traditional)',
      'ja': 'Japanese',
      'ko': 'Korean',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'ur': 'Urdu',
      'vi': 'Vietnamese',
      'th': 'Thai',
      'pl': 'Polish',
      'tr': 'Turkish',
      'nl': 'Dutch',
      'sv': 'Swedish',
      'da': 'Danish',
      'no': 'Norwegian',
      'fi': 'Finnish',
      'he': 'Hebrew',
      'el': 'Greek',
      'cs': 'Czech',
      'hu': 'Hungarian',
      'ro': 'Romanian',
      'bg': 'Bulgarian',
      'hr': 'Croatian',
      'sk': 'Slovak',
      'sl': 'Slovenian',
      'et': 'Estonian',
      'lv': 'Latvian',
      'lt': 'Lithuanian',
      'mt': 'Maltese',
      'ga': 'Irish',
      'cy': 'Welsh',
      'eu': 'Basque',
      'ca': 'Catalan',
      'gl': 'Galician'
    };
  }

  /**
   * Get document types
   */
  getDocumentTypes() {
    return {
      'general': 'General Educational Document',
      'iep': 'Individualized Education Program (IEP)',
      'report_card': 'Report Card',
      'parent_communication': 'Parent/Guardian Communication',
      'evaluation': 'Educational Evaluation',
      'assessment': 'Assessment Report',
      'discipline': 'Disciplinary Action',
      'medical': 'Medical Documentation',
      'legal': 'Legal Document'
    };
  }
}

module.exports = new ClaudeService();
