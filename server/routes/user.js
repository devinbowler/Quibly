// routes/user.js
const express = require('express');
const { signupUser, loginUser, verifyOTP, resendOTP } = require('../controllers/userController');

const router = express.Router();

// Login route
router.post('/login', loginUser);

// Signup route – sends OTP and returns "PENDING" status
router.post('/signup', signupUser);

// OTP verification route – client posts email and otp to verify
router.post('/verify-otp', verifyOTP);

// POST /api/user/resend-otp
router.post('/resend-otp', resendOTP);

module.exports = router;
