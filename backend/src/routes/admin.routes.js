const express = require('express');
const router = express.Router();

const { verifyToken, isAdmin } = require('../middleware/auth');
const adminController = require('../controllers/admin.controller');

// ✅ SECURE ADMIN ROUTES
router.get('/stats', verifyToken, isAdmin, adminController.getDashboardStats);
router.get('/students', verifyToken, isAdmin, adminController.getStudents);
router.post('/reset-attempt', verifyToken, isAdmin, adminController.resetStudentAttempt);
router.get('/analytics/quiz/:id', verifyToken, isAdmin, adminController.getQuizAnalytics);
router.get('/analytics/global', verifyToken, isAdmin, adminController.getGlobalAnalytics);
router.get('/analytics/difficult/:quizId', verifyToken, isAdmin, adminController.getDifficultQuestions);

module.exports = router;