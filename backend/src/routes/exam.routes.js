const express = require('express');
const router = express.Router();
const examController = require('../controllers/exam.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/start', verifyToken, examController.startAttempt);
router.post('/save', verifyToken, examController.saveProgress);
router.get('/progress/:attemptId', verifyToken, examController.getAttemptProgress);
router.get('/time/:attemptId', verifyToken, examController.getRemainingTime);
router.post('/submit', verifyToken, examController.submitExam);

module.exports = router;
