const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const analyticsController = require('../controllers/analytics.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

router.get('/stats', verifyToken, isAdmin, adminController.getDashboardStats);
router.post('/reset-attempt', verifyToken, isAdmin, adminController.resetStudentAttempt);
router.get('/analytics/:quizId', verifyToken, isAdmin, analyticsController.getQuizAnalytics);

module.exports = router;
