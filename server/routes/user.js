// routes/user.js
const express = require('express');
const { signupUser, loginUser, verifyOTP, resendOTP, updateUser, deleteAccount } = require('../controllers/userController');

const router = express.Router();

// Login route
router.post('/login', loginUser);

// Signup route – sends OTP and returns "PENDING" status
router.post('/signup', signupUser);

// Update user info route (for updating email and password)
router.post('/update', updateUser);

// Delete account route
router.delete('/delete', deleteAccount);

// OTP verification route – client posts email and otp to verify
router.post('/verify-otp', verifyOTP);

// Resend OTP route – resend the OTP code
router.post('/resend-otp', resendOTP);

module.exports = router;
