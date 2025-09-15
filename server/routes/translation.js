const express = require('express');
const { body, validationResult } = require('express-validator');
const claudeService = require('../services/claudeService');
const documentService = require('../services/documentService');
const { errorHandler } = require('../middleware/errorHandler');
// Simple logger for now
const logger = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${msg}`)
};

const router = express.Router();

// Validation middleware
const validateTranslationRequest = [
  body('text').notEmpty().withMessage('Text is required'),
  body('sourceLanguage').notEmpty().withMessage('Source language is required'),
  body('targetLanguage').notEmpty().withMessage('Target language is required'),
  body('documentType').optional().isIn(Object.keys(claudeService.getDocumentTypes()))
];

/**
 * POST /api/translation/translate
 * Translate text using Claude Sonnet 4
 */
router.post('/translate', validateTranslationRequest, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { text, sourceLanguage, targetLanguage, documentType = 'general', options = {} } = req.body;
    const userId = req.user.id;

    logger.info(`Translation request from user ${userId}: ${sourceLanguage} -> ${targetLanguage}`);

    const result = await claudeService.translateText(
      text,
      sourceLanguage,
      targetLanguage,
      documentType,
      options
    );

    // Calculate word count for billing
    const wordCount = documentService.calculateWordCount(text);
    const billingWordCount = documentService.calculateTranslatedWordCount(text, result.translatedText);

    // Save translation record
    const translationRecord = await documentService.saveTranslation({
      userId,
      originalText: text,
      translatedText: result.translatedText,
      sourceLanguage,
      targetLanguage,
      documentType,
      confidenceScore: result.confidenceScore,
      wordCount,
      billingWordCount,
      usage: result.usage,
      model: result.model
    });

    res.json({
      success: true,
      translation: result.translatedText,
      confidenceScore: result.confidenceScore,
      wordCount,
      billingWordCount,
      usage: result.usage,
      translationId: translationRecord._id,
      timestamp: result.timestamp
    });

  } catch (error) {
    logger.error('Translation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Translation failed', 
      message: error.message 
    });
  }
});

/**
 * POST /api/translation/batch
 * Batch translate multiple texts
 */
router.post('/batch', [
  body('texts').isArray({ min: 1 }).withMessage('Texts array is required'),
  body('sourceLanguage').notEmpty().withMessage('Source language is required'),
  body('targetLanguage').notEmpty().withMessage('Target language is required'),
  body('documentType').optional().isIn(Object.keys(claudeService.getDocumentTypes()))
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { texts, sourceLanguage, targetLanguage, documentType = 'general' } = req.body;
    const userId = req.user.id;

    logger.info(`Batch translation request from user ${userId}: ${texts.length} texts, ${sourceLanguage} -> ${targetLanguage}`);

    const results = await claudeService.batchTranslate(
      texts,
      sourceLanguage,
      targetLanguage,
      documentType
    );

    // Save batch translation record
    const batchRecord = await documentService.saveBatchTranslation({
      userId,
      texts,
      results,
      sourceLanguage,
      targetLanguage,
      documentType
    });

    res.json({
      success: true,
      results,
      batchId: batchRecord._id,
      totalTexts: texts.length,
      successfulTranslations: results.filter(r => r.success).length,
      failedTranslations: results.filter(r => !r.success).length
    });

  } catch (error) {
    logger.error('Batch translation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Batch translation failed', 
      message: error.message 
    });
  }
});

/**
 * GET /api/translation/languages
 * Get supported languages
 */
router.get('/languages', (req, res) => {
  try {
    const languages = claudeService.getSupportedLanguages();
    res.json({ success: true, languages });
  } catch (error) {
    logger.error('Error getting languages:', error);
    res.status(500).json({ success: false, error: 'Failed to get languages' });
  }
});

/**
 * GET /api/translation/document-types
 * Get supported document types
 */
router.get('/document-types', (req, res) => {
  try {
    const documentTypes = claudeService.getDocumentTypes();
    res.json({ success: true, documentTypes });
  } catch (error) {
    logger.error('Error getting document types:', error);
    res.status(500).json({ success: false, error: 'Failed to get document types' });
  }
});

/**
 * GET /api/translation/history
 * Get translation history for user
 */
router.get('/history', async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, documentType, sourceLanguage, targetLanguage } = req.query;

    const history = await documentService.getTranslationHistory({
      userId,
      page: parseInt(page),
      limit: parseInt(limit),
      documentType,
      sourceLanguage,
      targetLanguage
    });

    res.json({ success: true, ...history });
  } catch (error) {
    logger.error('Error getting translation history:', error);
    res.status(500).json({ success: false, error: 'Failed to get translation history' });
  }
});

/**
 * GET /api/translation/analytics
 * Get translation analytics for user
 */
router.get('/analytics', async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30d' } = req.query;

    const analytics = await documentService.getTranslationAnalytics(userId, period);

    res.json({ success: true, analytics });
  } catch (error) {
    logger.error('Error getting translation analytics:', error);
    res.status(500).json({ success: false, error: 'Failed to get analytics' });
  }
});

/**
 * PUT /api/translation/:id/review
 * Update translation with human review
 */
router.put('/:id/review', [
  body('reviewedText').notEmpty().withMessage('Reviewed text is required'),
  body('qualityRating').optional().isInt({ min: 1, max: 5 }).withMessage('Quality rating must be 1-5'),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { reviewedText, qualityRating, notes } = req.body;
    const userId = req.user.id;

    const updatedTranslation = await documentService.updateTranslationReview({
      translationId: id,
      userId,
      reviewedText,
      qualityRating,
      notes
    });

    res.json({ success: true, translation: updatedTranslation });
  } catch (error) {
    logger.error('Error updating translation review:', error);
    res.status(500).json({ success: false, error: 'Failed to update review' });
  }
});

module.exports = router;
