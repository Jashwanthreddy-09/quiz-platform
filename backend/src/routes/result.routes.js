const express = require('express');
const router = express.Router();
const resultController = require('../controllers/result.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/history', verifyToken, resultController.getStudentHistory);
router.get('/:resultId', verifyToken, resultController.getResultDetail);

module.exports = router;
