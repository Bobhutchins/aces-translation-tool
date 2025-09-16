const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { v4: uuidv4 } = require('uuid');
// Simple logger for now
const logger = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${msg}`)
};

class DocumentService {
  constructor() {
    this.uploadPath = process.env.UPLOAD_PATH || './uploads';
    this.supportedFormats = {
      'application/pdf': 'pdf',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'text/plain': 'txt',
      'text/rtf': 'rtf'
    };
    // In-memory storage for translation data (in production, use MongoDB)
    this.translations = new Map();
  }

  /**
   * Extract text from uploaded document
   */
  async extractTextFromDocument(filePath, mimeType) {
    try {
      const format = this.supportedFormats[mimeType];
      if (!format) {
        throw new Error(`Unsupported file format: ${mimeType}`);
      }

      let text = '';

      switch (format) {
        case 'pdf':
          const pdfBuffer = await fs.readFile(filePath);
          const pdfData = await pdfParse(pdfBuffer);
          text = pdfData.text;
          break;

        case 'docx':
          const docxBuffer = await fs.readFile(filePath);
          const docxResult = await mammoth.extractRawText({ buffer: docxBuffer });
          text = docxResult.value;
          break;

        case 'doc':
          // For .doc files, we'll need a different library or conversion
          throw new Error('DOC format not yet supported. Please convert to DOCX.');

        case 'txt':
        case 'rtf':
          text = await fs.readFile(filePath, 'utf-8');
          break;

        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      return {
        text: text.trim(),
        wordCount: this.calculateWordCount(text),
        characterCount: text.length,
        format
      };

    } catch (error) {
      logger.error('Error extracting text from document:', error);
      throw new Error(`Failed to extract text: ${error.message}`);
    }
  }

  /**
   * Calculate accurate word count for billing purposes
   * This counts actual words that need translation, excluding numbers, symbols, etc.
   */
  calculateWordCount(text) {
    if (!text || typeof text !== 'string') return 0;
    
    // Remove extra whitespace and normalize
    const normalizedText = text.trim().replace(/\s+/g, ' ');
    
    // Split by whitespace and filter out non-word tokens
    const words = normalizedText.split(/\s+/).filter(word => {
      // Remove empty strings
      if (!word) return false;
      
      // Count words that contain at least one letter (for translation purposes)
      // This excludes pure numbers, symbols, or punctuation-only tokens
      return /[a-zA-Z]/.test(word);
    });
    
    return words.length;
  }

  /**
   * Calculate translated word count (for billing)
   * This counts words in the translated text that were actually translated
   */
  calculateTranslatedWordCount(originalText, translatedText) {
    // For billing purposes, we count the original words that were translated
    // This ensures consistent billing regardless of target language word count differences
    return this.calculateWordCount(originalText);
  }

  /**
   * Save uploaded file
   */
  async saveUploadedFile(file, userId) {
    try {
      const fileId = uuidv4();
      const fileExtension = path.extname(file.originalname);
      const fileName = `${fileId}${fileExtension}`;
      const filePath = path.join(this.uploadPath, fileName);

      // Ensure upload directory exists
      await fs.mkdir(this.uploadPath, { recursive: true });

      // Move file to upload directory
      await fs.rename(file.path, filePath);

      const fileInfo = {
        fileId,
        originalName: file.originalname,
        fileName,
        filePath,
        mimeType: file.mimetype,
        size: file.size,
        uploadedBy: userId,
        uploadedAt: new Date()
      };

      logger.info(`File saved: ${fileName} by user ${userId}`);
      return fileInfo;

    } catch (error) {
      logger.error('Error saving uploaded file:', error);
      throw new Error(`Failed to save file: ${error.message}`);
    }
  }

  /**
   * Process document for translation
   */
  async processDocument(fileInfo, sourceLanguage, targetLanguage, documentType = 'general') {
    try {
      // Extract text from document
      const extractedData = await this.extractTextFromDocument(
        fileInfo.filePath, 
        fileInfo.mimeType
      );

      // Split text into manageable chunks for translation
      const chunks = this.splitTextIntoChunks(extractedData.text, 1000);

      const processedDocument = {
        fileId: fileInfo.fileId,
        originalName: fileInfo.originalName,
        sourceLanguage,
        targetLanguage,
        documentType,
        extractedText: extractedData.text,
        chunks,
        wordCount: extractedData.wordCount,
        characterCount: extractedData.characterCount,
        format: extractedData.format,
        processedAt: new Date()
      };

      logger.info(`Document processed: ${fileInfo.originalName}, ${chunks.length} chunks`);
      return processedDocument;

    } catch (error) {
      logger.error('Error processing document:', error);
      throw new Error(`Failed to process document: ${error.message}`);
    }
  }

  /**
   * Split text into chunks for translation
   */
  splitTextIntoChunks(text, maxChunkSize = 1000) {
    const sentences = text.split(/(?<=[.!?])\s+/);
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    // Limit the number of chunks to prevent timeout
    if (chunks.length > 50) {
      logger.warn(`Document has ${chunks.length} chunks, limiting to 50 for performance`);
      return chunks.slice(0, 50);
    }

    return chunks;
  }

  /**
   * Reconstruct document from translated chunks
   */
  reconstructDocument(originalChunks, translatedChunks, format) {
    try {
      // For now, we'll return the translated text
      // In a full implementation, you'd want to preserve formatting
      const translatedText = translatedChunks.join('\n\n');
      
      return {
        translatedText,
        originalChunks,
        translatedChunks,
        format,
        reconstructedAt: new Date()
      };

    } catch (error) {
      logger.error('Error reconstructing document:', error);
      throw new Error(`Failed to reconstruct document: ${error.message}`);
    }
  }

  /**
   * Generate document filename for export
   */
  generateExportFilename(originalName, targetLanguage, format) {
    const nameWithoutExt = path.parse(originalName).name;
    const timestamp = new Date().toISOString().split('T')[0];
    return `${nameWithoutExt}_${targetLanguage}_${timestamp}.${format}`;
  }

  /**
   * Save translation record to database (mock implementation)
   */
  async saveTranslation(translationData) {
    // In a real implementation, this would save to MongoDB
    const translationRecord = {
      _id: uuidv4(),
      ...translationData,
      createdAt: new Date(),
      status: 'completed'
    };

    logger.info(`Translation saved: ${translationRecord._id}`);
    return translationRecord;
  }

  /**
   * Save batch translation record
   */
  async saveBatchTranslation(batchData) {
    const batchRecord = {
      _id: uuidv4(),
      ...batchData,
      createdAt: new Date(),
      status: 'completed'
    };

    logger.info(`Batch translation saved: ${batchRecord._id}`);
    return batchRecord;
  }

  /**
   * Get translation history
   */
  async getTranslationHistory(filters) {
    // Mock implementation - in real app, query MongoDB
    return {
      translations: [],
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: 0,
        pages: 0
      }
    };
  }

  /**
   * Get translation analytics
   */
  async getTranslationAnalytics(userId, period) {
    // Mock implementation
    return {
      totalTranslations: 0,
      totalWords: 0,
      averageConfidence: 0,
      topLanguages: [],
      documentTypeBreakdown: {},
      period
    };
  }

  /**
   * Update translation review
   */
  async updateTranslationReview(reviewData) {
    // Mock implementation
    return {
      _id: reviewData.translationId,
      ...reviewData,
      reviewedAt: new Date()
    };
  }

  /**
   * Clean up old files
   */
  async cleanupOldFiles(daysOld = 30) {
    try {
      const files = await fs.readdir(this.uploadPath);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(this.uploadPath, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath);
          deletedCount++;
        }
      }

      logger.info(`Cleaned up ${deletedCount} old files`);
      return { deletedCount };

    } catch (error) {
      logger.error('Error cleaning up old files:', error);
      throw error;
    }
  }

  /**
   * Store translation data
   */
  storeTranslation(fileId, translationData) {
    // Calculate accurate translated word count for billing
    const translatedWordCount = this.calculateTranslatedWordCount(
      translationData.originalText, 
      translationData.translatedText
    );
    
    this.translations.set(fileId, {
      ...translationData,
      translatedWordCount, // Add billing word count
      translatedAt: new Date().toISOString()
    });
    logger.info(`Translation stored for file: ${fileId}, billing words: ${translatedWordCount}`);
  }

  /**
   * Get translation data
   */
  getTranslation(fileId) {
    return this.translations.get(fileId);
  }

  /**
   * Get file info
   */
  async getFileInfo(fileId) {
    try {
      // Find the actual file with the fileId (it might have different extensions)
      const files = await fs.readdir(this.uploadPath);
      const file = files.find(f => f.startsWith(fileId));
      
      if (!file) {
        throw new Error('File not found');
      }
      
      const filePath = path.join(this.uploadPath, file);
      const stats = await fs.stat(filePath);
      
      // Determine mime type from file extension
      const ext = path.extname(file).toLowerCase();
      const mimeTypes = {
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.txt': 'text/plain',
        '.rtf': 'text/rtf'
      };
      
      const fileInfo = {
        fileId,
        fileName: file,
        filePath,
        mimeType: mimeTypes[ext] || 'application/octet-stream',
        originalName: file, // We don't have the original name stored, so use the file name
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
      };

      // Add translation data if available
      const translation = this.getTranslation(fileId);
      if (translation) {
        fileInfo.translation = translation;
        // Add billing word count to the main file info for easy access
        fileInfo.billingWordCount = translation.billingWordCount || translation.wordCount;
        fileInfo.wordCount = translation.wordCount;
        fileInfo.sourceLanguage = translation.sourceLanguage;
        fileInfo.targetLanguage = translation.targetLanguage;
        fileInfo.documentType = translation.documentType;
        fileInfo.confidenceScore = translation.confidenceScore;
      }

      return fileInfo;

    } catch (error) {
      logger.error('Error getting file info:', error);
      throw new Error('File not found');
    }
  }
}

module.exports = new DocumentService();
