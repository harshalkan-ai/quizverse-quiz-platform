const express = require('express');
const router = express.Router();
const attemptController = require('../controllers/attemptController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.post('/start', attemptController.startAttempt);
router.post('/submit', attemptController.submitAttempt);
router.get('/history', attemptController.getUserAttempts);
router.get('/:id', attemptController.getAttemptById);

module.exports = router;
