const express = require('express')

// controller functions 
const { signupUser, loginUser, googleLogin, googleSignup } = require('../controllers/userController');

const router = express.Router()

// login route 
router.post('/login', loginUser)

// signup route
router.post('/signup', signupUser)

router.post('/google-login', googleLogin);

router.post('/google-signup', googleSignup);


module.exports = router
