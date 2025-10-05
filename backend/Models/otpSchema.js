const mongoose = require('mongoose');
const otpSchema = new mongoose.Schema({
    mobile: String,
    otp: String,
    expiresAt: Date,
  });
  
  const Otp = mongoose.model("Otp", otpSchema);
  module.exports = Otp;
  