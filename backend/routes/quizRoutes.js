const express = require('express');
const router = express.Router();
const { createQuiz, getAllQuizzes, togglePublishQuiz, deleteQuiz } = require('../controllers/quizController');
const authenticateToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// Authenticated Users (Filtered dynamically for Admin vs Student)
router.get('/', authenticateToken, getAllQuizzes);

// Protected Admin Routes
router.post('/', authenticateToken, requireRole('ADMIN'), createQuiz);
router.patch('/:id/publish', authenticateToken, requireRole('ADMIN'), togglePublishQuiz);
router.delete('/:id', authenticateToken, requireRole('ADMIN'), deleteQuiz);

module.exports = router;