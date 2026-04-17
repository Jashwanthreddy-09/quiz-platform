const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { verifyToken } = require('../middleware/auth');

router.get('/dashboard', verifyToken, studentController.getStudentDashboard);

module.exports = router;
