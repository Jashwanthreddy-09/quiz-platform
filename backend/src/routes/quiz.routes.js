const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

router.get('/', quizController.getAllQuizzes);
router.get('/:id', quizController.getQuizById);

// Protected Admin Routes
router.post('/', verifyToken, isAdmin, quizController.createQuiz);
router.put('/:id', verifyToken, isAdmin, quizController.updateQuiz);
router.delete('/:id', verifyToken, isAdmin, quizController.deleteQuiz);

module.exports = router;
