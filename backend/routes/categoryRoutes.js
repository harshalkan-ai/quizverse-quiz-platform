const express = require('express');
const router = express.Router();
const { createCategory, getAllCategories, deleteCategory } = require('../controllers/categoryController');
const authenticateToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// Public / Logged-in Users
router.get('/', getAllCategories);

// Protected Admin Routes
router.post('/', authenticateToken, requireRole('ADMIN'), createCategory);
router.delete('/:id', authenticateToken, requireRole('ADMIN'), deleteCategory);

module.exports = router;