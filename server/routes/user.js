const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const { 
  signupUser, 
  loginUser, 
  verifyOTP, 
  resendOTP, 
  // updateUser removed 
  requestPasswordReset, 
  changePassword, 
  deleteAccount 
} = require('../controllers/userController');

const router = express.Router();

// Login route
router.post('/login', loginUser);

// Signup route – sends OTP and returns "PENDING" status
router.post('/signup', signupUser);

// Password reset routes
router.post('/forgot-password', requestPasswordReset);
router.post('/change-password', requireAuth, changePassword);

// Delete account route (requires auth)
router.delete('/delete', requireAuth, deleteAccount);

// OTP verification route – client posts email and otp to verify
router.post('/verify-otp', verifyOTP);

// Resend OTP route – resend the OTP code
router.post('/resend-otp', resendOTP);

module.exports = router;
