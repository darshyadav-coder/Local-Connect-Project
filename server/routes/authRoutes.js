const express = require('express');
const router = express.Router();
const {
  registerUser,
  authUser,
  forgotPassword,
  verifySecurityAnswer,
  getMe,
  logout,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-answer', verifySecurityAnswer);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
