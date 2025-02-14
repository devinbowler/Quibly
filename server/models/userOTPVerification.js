const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userOTPVerificationSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true }, // hashed temporary password
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

const UserOTPVerification = mongoose.model(
  "UserOTPVerification",
  userOTPVerificationSchema
);

module.exports = UserOTPVerification;