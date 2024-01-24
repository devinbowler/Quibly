const express = require('express')

// controller functions 
const { signupUser, loginUser, googleLogin } = require('../controllers/userController')

const router = express.Router()

// login route 
router.post('/login', loginUser)

// signup route
router.post('/signup', signupUser)

// In your userRoutes.js
router.post('/google-login', googleLogin);


module.exports = router
