const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID); // Replace with your Client ID

const createToken = (_id) => {
    return jwt.sign({_id}, process.env.SECRET, {expiresIn: '3d'})
}


// login user
const loginUser = async (req, res) => {
    const {email, password} = req.body

    try {
        const user = await User.login(email, password)

        // create a token
        const token = createToken(user._id)

        res.status(200).json({email, token})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}


// singup user
const signupUser = async (req, res) => {
    const {email, password} = req.body

    try {
        const user = await User.signup(email, password)

        // create a token
        const token = createToken(user._id)

        res.status(200).json({email, token})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

const googleLogin = async (req, res) => {
    const { token }  = req.body; // Frontend should send the Google token
  
    try {
      // Verify the token with Google
      const ticket = await client.verifyIdToken({
          idToken: token,
          audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      });
  
      const payload = ticket.getPayload();
  
      // Check if user exists in your DB
      let user = await User.findOne({ email: payload.email });
      if (!user) {
          // If user doesn't exist, create a new one
          user = await User.create({ email: payload.email, password: 'your-random-password' });
          // You might want to handle password field differently for Google users
      }
  
      // Generate a token, send back user data and token to the frontend
      const userToken = 'Your method to generate token';
  
      res.status(200).json({ user, token: userToken });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  


module.exports = { signupUser, loginUser, googleLogin}
