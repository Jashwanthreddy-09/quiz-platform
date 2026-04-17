const { submitExam } = require('../controllers/exam.controller');
const express = require('express');
const router = express.Router();
const examController = require('../controllers/exam.controller');
const { verifyToken } = require('../middleware/auth');

router.post('/start', verifyToken, examController.startAttempt);
router.post('/save', verifyToken, examController.saveProgress);
router.get('/progress/:attemptId', verifyToken, examController.getAttemptProgress);
router.get('/time/:attemptId', verifyToken, examController.getRemainingTime);
router.post('/submit', verifyToken, examController.submitExam);
router.get('/:examId/questions', verifyToken, examController.getExamQuestions);

module.exports = router;
