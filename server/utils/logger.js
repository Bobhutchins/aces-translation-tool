const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const logDir = path.join(__dirname, '../../logs');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'aces-translation-tool' },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // Write all logs to file
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Write all logs to combined file
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Add request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id
    };
    
    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });
  
  next();
};

// Security event logger
const securityLogger = {
  loginAttempt: (email, success, ip) => {
    logger.info('Login attempt', {
      event: 'login_attempt',
      email,
      success,
      ip,
      timestamp: new Date().toISOString()
    });
  },
  
  unauthorizedAccess: (userId, resource, ip) => {
    logger.warn('Unauthorized access attempt', {
      event: 'unauthorized_access',
      userId,
      resource,
      ip,
      timestamp: new Date().toISOString()
    });
  },
  
  fileUpload: (userId, fileName, fileSize, ip) => {
    logger.info('File upload', {
      event: 'file_upload',
      userId,
      fileName,
      fileSize,
      ip,
      timestamp: new Date().toISOString()
    });
  },
  
  translationRequest: (userId, sourceLang, targetLang, wordCount, ip) => {
    logger.info('Translation request', {
      event: 'translation_request',
      userId,
      sourceLang,
      targetLang,
      wordCount,
      ip,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  ...logger,
  requestLogger,
  securityLogger
};
