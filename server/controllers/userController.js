const User = require('../models/userModel');
const userOTPVerification = require('../models/userOTPVerification');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const validator = require('validator');
require("dotenv").config();


// Set up transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

// Create a JWT for login after verification
const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '7d' });
};

// ========================
// Signup – Initiate Verification
// ========================
const signupUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if a permanent user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Remove any existing pending OTP records for this email
    await userOTPVerification.deleteMany({ email });

    // Validate email and password
    if (!email || !password) {
      throw new Error('All fields must be filled');
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate a 4-digit OTP
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

    // Hash the OTP for secure storage
    const hashedOTP = await bcrypt.hash(otp, salt);

    // Create a temporary OTP verification record that expires in 1 hour
    const expiresAt = Date.now() + 3600000; // 1 hour from now
    const newOTPVerification = new userOTPVerification({
      email,
      password: hashedPassword,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt,
    });
    const savedOTPRecord = await newOTPVerification.save();

    // For testing purposes, log the OTP (remove before production)
    // console.log(`OTP for ${email}: ${otp}`);

    // Send the OTP via email
    await sendOTPVerificationEmail({ email, otp });

    // Return pending status along with the OTP record ID (and OTP for testing)
    res.status(200).json({
      status: "PENDING",
      message: "Verification OTP email sent.",
      data: { 
        userId: savedOTPRecord._id,
        email,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ========================
// Helper: Send OTP Email
// ========================
const sendOTPVerificationEmail = async ({ email, otp }) => {
  try {
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Verify Your Email",
      html: `<p>Enter <b>${otp}</b> in the app to verify your email address and complete your signup for Quibly. This code <b>expires in 1 hour.</b></p>`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error("Could not send OTP email");
  }
};

// ========================
// Login
// ========================
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.status(200).json({ 
      email, 
      token,
      passwordReset: user.passwordReset || false
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// ========================
// Verify OTP and Create Permanent User
// ========================
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    // Find the OTP record for this email
    const record = await userOTPVerification.findOne({ email });
    if (!record) {
      throw new Error("No OTP record found for this email");
    }

    // Check if the OTP record has expired
    if (record.expiresAt < Date.now()) {
      await userOTPVerification.deleteOne({ _id: record._id });
      throw new Error("OTP expired. Please request a new one.");
    }

    // Compare the provided OTP with the hashed OTP
    const isValid = await bcrypt.compare(otp, record.otp);
    if (!isValid) {
      throw new Error("Invalid OTP.");
    }

    // OTP is valid—create the permanent user
    const newUser = await User.create({
      email: record.email,
      password: record.password,
      verified: true,
    });

    // Remove the temporary OTP record
    await userOTPVerification.deleteOne({ _id: record._id });

    // Create a JWT token for the new user
    const token = createToken(newUser._id);
    res.status(200).json({
      status: "VERIFIED",
      message: "Email verified successfully.",
      data: { email: newUser.email, token },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ========================
// Resend OTP
// ========================
const resendOTP = async (req, res) => {
  const { email } = req.body;
  try {
    // Find the existing OTP record for this email
    const record = await userOTPVerification.findOne({ email });
    if (!record) {
      throw new Error("No pending OTP record found. Please sign up again.");
    }

    // Generate a new 4-digit OTP
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const salt = await bcrypt.genSalt(10);
    const hashedOTP = await bcrypt.hash(otp, salt);

    // Update the record with new OTP and expiry time
    record.otp = hashedOTP;
    record.createdAt = Date.now();
    record.expiresAt = Date.now() + 3600000; // 1 hour from now
    await record.save();

    // For testing, log the new OTP (remove before production)
    // console.log(`Resent OTP for ${email}: ${otp}`);

    // Send the new OTP via email
    await sendOTPVerificationEmail({ email, otp });

    res.status(200).json({
      status: "PENDING",
      message: "OTP has been resent.",
      data: {
        userId: record._id,
        email,
        otp // Remove this in production!
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Request password reset.
const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('No account with that email exists');
    }

    // Generate a temporary password (8 characters)
    const tempPassword = Math.random().toString(36).slice(-8);
    
    // Hash the temporary password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);
    
    // Update user's password
    user.password = hashedPassword;
    user.passwordReset = true; // Flag to indicate password should be changed
    await user.save();
    
    // Send email with temporary password
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Your Temporary Password",
      html: `<p>Your temporary password is: <b>${tempPassword}</b></p>
            <p>Please log in and change your password immediately for security reasons.</p>`,
    };
    
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({
      status: "SUCCESS",
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Change password.
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id;
  
  try {
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Check if current password is correct (skip for reset passwords)
    if (!user.passwordReset) {
      // Only check current password if not in password reset mode
      if (currentPassword) {
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          throw new Error('Current password is incorrect');
        }
      } else {
        throw new Error('Current password is required');
      }
    }
    
    // Validate new password - simpler validation to avoid issues
    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters');
    }
    
    // Update password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    user.password = hashedPassword;
    user.passwordReset = false; // Reset the flag
    await user.save();
    
    res.status(200).json({
      status: "SUCCESS",
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
  
  // Delete Account – deletes the authenticated user's account
  const deleteAccount = async (req, res) => {
    const userId = req.user._id; // assuming authentication middleware sets req.user
    try {
      const deletedUser = await User.findByIdAndDelete(userId);
      if (!deletedUser) throw new Error("User not found");
      res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  module.exports = {
    signupUser,
    loginUser,
    verifyOTP,
    resendOTP,
    requestPasswordReset,
    changePassword,
    deleteAccount
  };
