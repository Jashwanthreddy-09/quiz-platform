const express = require('express');
const router = express.Router();
const executionController = require('../controllers/execution.controller');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, executionController.runCode);

module.exports = router;
