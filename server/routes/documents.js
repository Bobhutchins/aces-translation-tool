const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const documentService = require('../services/documentService');
const claudeService = require('../services/claudeService');
// Simple security logger for now
const securityLogger = {
  loginAttempt: (email, success, ip) => {
    console.log(`[SECURITY] Login attempt: ${email}, success: ${success}, ip: ${ip}`);
  },
  unauthorizedAccess: (userId, resource, ip) => {
    console.log(`[SECURITY] Unauthorized access: user ${userId}, resource: ${resource}, ip: ${ip}`);
  },
  fileUpload: (userId, fileName, fileSize, ip) => {
    console.log(`[SECURITY] File upload: user ${userId}, file: ${fileName}, size: ${fileSize}, ip: ${ip}`);
  },
  translationRequest: (userId, sourceLang, targetLang, wordCount, ip) => {
    console.log(`[SECURITY] Translation request: user ${userId}, ${sourceLang}->${targetLang}, words: ${wordCount}, ip: ${ip}`);
  }
};

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/rtf'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, TXT, and RTF files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10 // Maximum 10 files per request
  }
});

/**
 * POST /api/documents/upload
 * Upload and process document for translation
 */
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const userId = req.user.id;
    const { sourceLanguage, targetLanguage, documentType = 'general' } = req.body;

    // Validate required fields
    if (!sourceLanguage || !targetLanguage) {
      return res.status(400).json({
        success: false,
        error: 'Source and target languages are required'
      });
    }

    // Log file upload
    securityLogger.fileUpload(userId, req.file.originalname, req.file.size, req.ip);

    // Save uploaded file
    const fileInfo = await documentService.saveUploadedFile(req.file, userId);

    // Process document
    const processedDocument = await documentService.processDocument(
      fileInfo,
      sourceLanguage,
      targetLanguage,
      documentType
    );

    res.json({
      success: true,
      document: {
        fileId: fileInfo.fileId,
        originalName: fileInfo.originalName,
        sourceLanguage,
        targetLanguage,
        documentType,
        wordCount: processedDocument.wordCount,
        characterCount: processedDocument.characterCount,
        chunks: processedDocument.chunks.length,
        format: processedDocument.format,
        uploadedAt: fileInfo.uploadedAt
      }
    });

  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Document upload failed',
      message: error.message
    });
  }
});

/**
 * POST /api/documents/translate
 * Translate uploaded document
 */
router.post('/translate', [
  body('fileId').notEmpty().withMessage('File ID is required'),
  body('sourceLanguage').notEmpty().withMessage('Source language is required'),
  body('targetLanguage').notEmpty().withMessage('Target language is required'),
  body('documentType').optional().isIn(Object.keys(claudeService.getDocumentTypes()))
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fileId, sourceLanguage, targetLanguage, documentType = 'general' } = req.body;
    const userId = req.user.id;

    // Get file info
    const fileInfo = await documentService.getFileInfo(fileId);
    
    // Process document if not already processed
    const processedDocument = await documentService.processDocument(
      fileInfo,
      sourceLanguage,
      targetLanguage,
      documentType
    );

    // Translate each chunk
    const translationResults = await claudeService.batchTranslate(
      processedDocument.chunks,
      sourceLanguage,
      targetLanguage,
      documentType
    );

    // Check for failed translations
    const failedTranslations = translationResults.filter(r => !r.success);
    if (failedTranslations.length > 0) {
      return res.status(500).json({
        success: false,
        error: 'Some translations failed',
        failedTranslations: failedTranslations.length,
        totalChunks: translationResults.length
      });
    }

    // Extract translated texts
    const translatedChunks = translationResults.map(r => r.translatedText);

    // Reconstruct document
    const reconstructedDocument = documentService.reconstructDocument(
      processedDocument.chunks,
      translatedChunks,
      processedDocument.format
    );

    // Calculate overall confidence score
    const confidenceScores = translationResults.map(r => r.confidenceScore);
    const averageConfidence = confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length;

    // Log translation request
    securityLogger.translationRequest(
      userId, 
      sourceLanguage, 
      targetLanguage, 
      processedDocument.wordCount, 
      req.ip
    );

    // Calculate accurate billing word count
    const billingWordCount = documentService.calculateTranslatedWordCount(
      processedDocument.extractedText,
      reconstructedDocument.translatedText
    );

    // Store translation data
    const translationData = {
      fileId,
      originalText: processedDocument.extractedText,
      translatedText: reconstructedDocument.translatedText,
      sourceLanguage,
      targetLanguage,
      documentType,
      confidenceScore: averageConfidence,
      wordCount: processedDocument.wordCount, // Original word count
      billingWordCount, // Accurate word count for billing
      chunks: translationResults.length,
      usage: translationResults.reduce((total, r) => ({
        inputTokens: total.inputTokens + r.usage.inputTokens,
        outputTokens: total.outputTokens + r.usage.outputTokens,
        totalTokens: total.totalTokens + r.usage.totalTokens
      }), { inputTokens: 0, outputTokens: 0, totalTokens: 0 }),
      translatedAt: new Date().toISOString()
    };

    // Store the translation data
    documentService.storeTranslation(fileId, translationData);

    res.json({
      success: true,
      translation: translationData
    });

  } catch (error) {
    console.error('Document translation error:', error);
    res.status(500).json({
      success: false,
      error: 'Document translation failed',
      message: error.message
    });
  }
});

/**
 * GET /api/documents/:fileId
 * Get document information
 */
router.get('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    const fileInfo = await documentService.getFileInfo(fileId);

    res.json({
      success: true,
      document: fileInfo
    });

  } catch (error) {
    console.error('Get document error:', error);
    res.status(404).json({
      success: false,
      error: 'Document not found'
    });
  }
});

/**
 * DELETE /api/documents/:fileId
 * Delete document
 */
router.delete('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    // In a real implementation, you'd delete the file and database record
    // For now, just return success
    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete document'
    });
  }
});

/**
 * GET /api/documents
 * Get user's documents
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, documentType, sourceLanguage, targetLanguage } = req.query;

    // Mock implementation - in real app, query database
    const documents = [];
    const total = 0;

    res.json({
      success: true,
      documents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get documents'
    });
  }
});

/**
 * POST /api/documents/export
 * Export translated document
 */
router.post('/export', [
  body('fileId').notEmpty().withMessage('File ID is required'),
  body('format').isIn(['pdf', 'docx', 'txt']).withMessage('Invalid export format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fileId, format, translatedText } = req.body;
    const userId = req.user.id;

    // Generate export filename
    const fileInfo = await documentService.getFileInfo(fileId);
    const exportFilename = documentService.generateExportFilename(
      fileInfo.originalName,
      'translated',
      format
    );

    // In a real implementation, you'd generate the file in the requested format
    // For now, return the filename and content
    res.json({
      success: true,
      export: {
        filename: exportFilename,
        format,
        content: translatedText,
        exportedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Export document error:', error);
    res.status(500).json({
      success: false,
      error: 'Export failed'
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 50MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files. Maximum is 10 files per request.'
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }

  next(error);
});

module.exports = router;
