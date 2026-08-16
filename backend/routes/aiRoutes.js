const express = require('express');
const router = express.Router();
const { generateQuestionsWithAI } = require('../controllers/aiController');
const authenticateToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// POST /api/ai/generate-questions (Admin Only)
router.post('/generate-questions', authenticateToken, requireRole('ADMIN'), generateQuestionsWithAI);

module.exports = router;
