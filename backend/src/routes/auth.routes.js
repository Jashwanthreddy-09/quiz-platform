const express = require('express');
const router = express.Router();
const passport = require('passport');
const multer = require('multer');
const path = require('path');
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth');

// Multer Config for Profile Pics
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles/');
  },
  filename: (req, file, cb) => {
    cb(null, `profile_${req.user.id}_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

// Standard Auth
router.post('/register', authController.register);
router.post('/login', authController.login);

// Profile Management
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, authController.updateProfile);
router.post('/profile-pic', verifyToken, upload.single('profilePic'), authController.uploadProfilePic);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  authController.googleSuccess
);

module.exports = router;

