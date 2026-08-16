const express = require('express');
const router = express.Router();
const { addQuestion, getQuizQuestions, deleteQuestion } = require('../controllers/questionController');
const authenticateToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// Get questions for a specific quiz (filtered for student vs admin)
router.get('/quiz/:quizId', authenticateToken, getQuizQuestions);

// Protected Admin Routes
router.post('/', authenticateToken, requireRole('ADMIN'), addQuestion);
router.delete('/:id', authenticateToken, requireRole('ADMIN'), deleteQuestion);

module.exports = router;
