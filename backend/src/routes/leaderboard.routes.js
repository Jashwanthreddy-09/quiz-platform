const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboard.controller');
const { verifyToken } = require('../middleware/auth');

router.get('/quiz/:quizId', verifyToken, leaderboardController.getQuizLeaderboard);
router.get('/global', verifyToken, leaderboardController.getGlobalLeaderboard);

module.exports = router;
