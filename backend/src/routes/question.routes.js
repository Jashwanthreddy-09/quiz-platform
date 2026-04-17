const express = require('express');
const router = express.Router();
const multer = require('multer');
const questionController = require('../controllers/question.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');

const upload = multer({ dest: 'uploads/' });

router.get('/template', verifyToken, isAdmin, questionController.downloadTemplate);
router.get('/:quiz_id', verifyToken, questionController.getQuizQuestions);
router.post('/manual', verifyToken, isAdmin, questionController.addQuestion);
router.post('/upload', verifyToken, isAdmin, upload.single('file'), questionController.uploadQuestions);
router.delete('/:id', verifyToken, isAdmin, questionController.deleteQuestion);

module.exports = router;
