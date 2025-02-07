const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID); // Replace with your Client ID

const createToken = (_id) => {
    return jwt.sign({_id}, process.env.SECRET, {expiresIn: '3d'});
};

// Existing controller functions
const loginUser = async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.status(200).json({email, token});
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

const signupUser = async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.signup(email, password);
        const token = createToken(user._id);
        res.status(200).json({email, token});
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

const googleLogin = async (req, res) => {
    const { token }  = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { sub, email, name, picture } = ticket.getPayload();

        let user = await User.findOne({ googleId: sub });

        if (!user) {
            user = await User.create({ email, password: null, googleId: sub });
            // handle the null password or set a random one
        }

        // Continue with creating a token for the user, etc.
        res.status(200).json({ user, token: createToken(user._id) });

    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

const googleSignup = async (req, res) => {
    const { token }  = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { sub, email, name, picture } = ticket.getPayload();

        let user = await User.findOne({ googleId: sub });

        if (!user) {
            // Your signup-specific logic here, for example:
            // - Check if the email is already associated with a non-Google account
            // - Send a welcome email to the user
            // - Create the user with additional signup information if needed
            user = await User.create({ email, googleId: sub, /* other fields */ });
            // Proceed to create a token and send back the response
        } else {
            // If the user already exists, you might want to return an error or log them in
            throw new Error('User already exists with this Google ID');
        }

        res.status(200).json({ user, token: createToken(user._id) });
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

module.exports = { signupUser, loginUser, googleLogin, googleSignup };
