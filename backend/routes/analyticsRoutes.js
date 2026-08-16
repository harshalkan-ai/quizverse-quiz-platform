const express = require('express');
const router = express.Router();
const { getAdminAnalytics, getLeaderboard } = require('../controllers/analyticsController');
const authenticateToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// GET /api/analytics/admin (Admin Only)
router.get('/admin', authenticateToken, requireRole('ADMIN'), getAdminAnalytics);

// GET /api/analytics/leaderboard (Students & Admins)
router.get('/leaderboard', authenticateToken, getLeaderboard);

module.exports = router;
