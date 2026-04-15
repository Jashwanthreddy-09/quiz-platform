const express = require('express');
const router = express.Router();
const multer = require('multer');
const questionController = require('../controllers/question.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

const upload = multer({ dest: 'uploads/' });

router.get('/:quiz_id', verifyToken, isAdmin, questionController.getQuizQuestions);
router.post('/manual', verifyToken, isAdmin, questionController.addQuestion);
router.post('/upload', verifyToken, isAdmin, upload.single('file'), questionController.uploadQuestions);

module.exports = router;
