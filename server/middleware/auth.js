const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Authenticate JWT token
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Access token required' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn(`Invalid token attempt: ${err.message}`);
      return res.status(403).json({ 
        success: false, 
        error: 'Invalid or expired token' 
      });
    }

    req.user = user;
    next();
  });
};

/**
 * Check if user has required role
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      logger.warn(`Unauthorized access attempt by user ${req.user.id} with role ${userRole}`);
      return res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions' 
      });
    }

    next();
  };
};

/**
 * Check if user can access resource
 */
const requireOwnershipOrRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    const userRole = req.user.role;
    const userId = req.user.id;
    const resourceUserId = req.params.userId || req.body.userId;

    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    // Allow if user has required role or owns the resource
    if (allowedRoles.includes(userRole) || userId === resourceUserId) {
      next();
    } else {
      logger.warn(`Unauthorized resource access attempt by user ${userId}`);
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied' 
      });
    }
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  requireOwnershipOrRole
};
