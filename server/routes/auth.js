const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
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

// Mock user database - in production, use MongoDB
const users = [
  {
    id: '1',
    email: 'admin@aces.org',
    password: '$2a$12$IKyKvyePvN.GtXifet61iuS7ukYs/XJQKt9AhutD5WrYIRf4xbtOW', // password: admin123
    name: 'ACES Administrator',
    role: 'admin',
    department: 'Translation Services',
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    email: 'translator@aces.org',
    password: '$2a$12$IKyKvyePvN.GtXifet61iuS7ukYs/XJQKt9AhutD5WrYIRf4xbtOW', // password: admin123
    name: 'Translation Specialist',
    role: 'translator',
    department: 'Translation Services',
    createdAt: new Date('2024-01-01')
  }
];

// Validation middleware
const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const validateRegister = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name is required'),
  body('department').trim().isLength({ min: 2 }).withMessage('Department is required')
];

/**
 * POST /api/auth/login
 * User login
 */
router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;
    const ip = req.ip;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      securityLogger.loginAttempt(email, false, ip);
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      securityLogger.loginAttempt(email, false, ip);
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        name: user.name 
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    securityLogger.loginAttempt(email, true, ip);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Login failed' 
    });
  }
});

/**
 * POST /api/auth/register
 * User registration (admin only)
 */
router.post('/register', validateRegister, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { email, password, name, department, role = 'translator' } = req.body;

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'User already exists' 
      });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = {
      id: (users.length + 1).toString(),
      email,
      password: hashedPassword,
      name,
      role,
      department,
      createdAt: new Date()
    };

    users.push(newUser);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        department: newUser.department
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Registration failed' 
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Access token required' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        error: 'Invalid token' 
      });
    }

    const user = users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        createdAt: user.createdAt
      }
    });
  });
});

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Access token required' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        error: 'Invalid token' 
      });
    }

    // Generate new token
    const newToken = jwt.sign(
      { 
        id: decoded.id, 
        email: decoded.email, 
        role: decoded.role,
        name: decoded.name 
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      token: newToken
    });
  });
});

/**
 * POST /api/auth/logout
 * User logout (client-side token removal)
 */
router.post('/logout', (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // You could implement a token blacklist here if needed
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;
