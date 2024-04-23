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
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.CLIENT_ID,
        });
        const payload = ticket.getPayload();
        let user = await User.findOne({ email: payload.email });
        if (!user) {
            user = await User.create({ email: payload.email, password: null });
        }
        const userToken = createToken(user._id);
        res.status(200).json({ user, token: userToken });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// New function to save/update Google user
const saveGoogleUser = async (req, res) => {
    const { googleId, email, token } = req.body;
    try {
        let user = await User.findOne({ googleId });
        if (!user) {
            user = new User({ googleId, email });
            await user.save();
        }
        res.status(200).json({ message: "User saved/updated successfully", user });
    } catch (error) {
        console.error("Database operation failed", error);
        res.status(500).json({ error: "Failed to save/update user", details: error.message });
    }
};



module.exports = { signupUser, loginUser, googleLogin, saveGoogleUser };
