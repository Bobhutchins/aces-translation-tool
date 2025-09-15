const express = require('express');
const { body, validationResult } = require('express-validator');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// Mock user database - in production, use MongoDB
let users = [
  {
    id: '1',
    email: 'admin@aces.org',
    name: 'ACES Administrator',
    role: 'admin',
    department: 'Translation Services',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date()
  },
  {
    id: '2',
    email: 'translator@aces.org',
    name: 'Translation Specialist',
    role: 'translator',
    department: 'Translation Services',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date()
  }
];

/**
 * GET /api/users
 * Get all users (admin only)
 */
router.get('/', requireRole('admin'), (req, res) => {
  try {
    const { page = 1, limit = 20, role, department, isActive } = req.query;

    let filteredUsers = users;

    // Apply filters
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }
    if (department) {
      filteredUsers = filteredUsers.filter(user => user.department === department);
    }
    if (isActive !== undefined) {
      filteredUsers = filteredUsers.filter(user => user.isActive === (isActive === 'true'));
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Remove sensitive information
    const safeUsers = paginatedUsers.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }));

    res.json({
      success: true,
      users: safeUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredUsers.length,
        pages: Math.ceil(filteredUsers.length / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get users'
    });
  }
});

/**
 * GET /api/users/:id
 * Get user by ID
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    // Users can only view their own profile unless they're admin
    if (id !== currentUserId && currentUserRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const user = users.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Remove sensitive information
    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    };

    res.json({
      success: true,
      user: safeUser
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user'
    });
  }
});

/**
 * PUT /api/users/:id
 * Update user (admin only or own profile)
 */
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('department').optional().trim().isLength({ min: 2 }).withMessage('Department is required'),
  body('role').optional().isIn(['admin', 'translator', 'reviewer']).withMessage('Invalid role'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;
    const { name, department, role, isActive } = req.body;

    // Users can only update their own profile unless they're admin
    if (id !== currentUserId && currentUserRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Only admins can change roles and active status
    if ((role || isActive !== undefined) && currentUserRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can change roles and active status'
      });
    }

    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update user
    if (name) users[userIndex].name = name;
    if (department) users[userIndex].department = department;
    if (role && currentUserRole === 'admin') users[userIndex].role = role;
    if (isActive !== undefined && currentUserRole === 'admin') users[userIndex].isActive = isActive;

    users[userIndex].updatedAt = new Date();

    // Remove sensitive information
    const safeUser = {
      id: users[userIndex].id,
      email: users[userIndex].email,
      name: users[userIndex].name,
      role: users[userIndex].role,
      department: users[userIndex].department,
      isActive: users[userIndex].isActive,
      createdAt: users[userIndex].createdAt,
      lastLogin: users[userIndex].lastLogin,
      updatedAt: users[userIndex].updatedAt
    };

    res.json({
      success: true,
      user: safeUser,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
});

/**
 * DELETE /api/users/:id
 * Delete user (admin only)
 */
router.delete('/:id', requireRole('admin'), (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    // Prevent self-deletion
    if (id === currentUserId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }

    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Soft delete - mark as inactive instead of removing
    users[userIndex].isActive = false;
    users[userIndex].deletedAt = new Date();

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
});

/**
 * GET /api/users/stats/overview
 * Get user statistics (admin only)
 */
router.get('/stats/overview', requireRole('admin'), (req, res) => {
  try {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const inactiveUsers = totalUsers - activeUsers;

    const roleStats = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    const departmentStats = users.reduce((acc, user) => {
      acc[user.department] = (acc[user.department] || 0) + 1;
      return acc;
    }, {});

    // Recent logins (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentLogins = users.filter(u => u.lastLogin > sevenDaysAgo).length;

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        recentLogins,
        roleStats,
        departmentStats
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user statistics'
    });
  }
});

/**
 * POST /api/users/:id/reset-password
 * Reset user password (admin only)
 */
router.post('/:id/reset-password', requireRole('admin'), [
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { newPassword } = req.body;

    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // In a real implementation, you'd hash the password
    // For now, just update the timestamp
    users[userIndex].passwordResetAt = new Date();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password'
    });
  }
});

module.exports = router;
