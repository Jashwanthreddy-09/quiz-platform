const express = require('express');
const router = express.Router();

const { verifyToken, isAdmin } = require('../middleware/auth');
const quizController = require('../controllers/quiz.controller');

// ✅ SECURE ROUTES
router.get('/', quizController.getAllQuizzes);
router.get('/:id', quizController.getQuizById);
router.post('/', verifyToken, isAdmin, quizController.createQuiz);
router.put('/:id', verifyToken, isAdmin, quizController.updateQuiz);
router.put('/:id/publish', verifyToken, isAdmin, quizController.publishQuiz);
router.delete('/:id', verifyToken, isAdmin, quizController.deleteQuiz);

module.exports = router;