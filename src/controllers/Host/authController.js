const UserS = require("../../services/customerService");
const User = require("../../models/userModel");
const { sendEmailService } = require("../../services/emailService");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const sendOtpForPasswordChange = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ EC: 1, message: "Email is required" });
    }
    const user = await User.findOne({ email, role: "host" });
    if (!user) {
      return res.status(404).json({ EC: 1, message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    user.otpSecret = otp;
    user.otpCreatedAt = new Date();

    //send Mail
    let htmlContent = fs.readFileSync(
      path.join(__dirname, "../../views/otpTemplate.html"),
      "utf-8"
    );
    htmlContent = htmlContent.replace("{{otp}}", otp);
    const text = `Your OTP code is ${otp}. This code will expire in 2 minutes.`;
    const subject = "Password Change OTP";
    try {
      const result_mail = await sendEmailService(
        email,
        subject,
        text,
        htmlContent
      );
      const result = await user.save();
      return res.status(200).json({
        EC: 0,
        result,
        result_mail,
        message: "OTP sent successfully",
      });
    } catch (saveError) {
      console.error("Error saving OTP:", saveError);
      return res.status(500).json({ EC: 1, message: "Failed to save OTP" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error sending OTP" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ EC: 1, message: "Email, OTP, and new password are required" });
    }

    const user = await User.findOne({ email, role: "host" });
    if (!user || !user.otpSecret) {
      return res.status(404).json({ EC: 1, message: "User or OTP not found" });
    }

    // Check if OTP is valid within 1 minute (60,000 ms)
    const otpAge = new Date() - user.otpCreatedAt;
    if (otpAge > 60000) {
      return res.status(400).json({ EC: 1, message: "OTP has expired" });
    }

    // Check if OTP matches
    if (user.otpSecret !== otp) {
      return res.status(400).json({ EC: 1, message: "Invalid OTP" });
    }

    // Validate password requirements
    const passwordRegex = /^(?=.*[A-Z])(?=.*\W).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        EC: 1,
        message:
          "Password must be at least 8 characters long, contain an uppercase letter, and a special character",
      });
    }

    // OTP is valid
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password and clear the OTP
    user.password = hashedPassword;
    user.otpSecret = undefined;
    user.otpCreatedAt = undefined;

    const updatedUser = await user.save();
    if (!updatedUser) {
      return res
        .status(500)
        .json({ EC: 1, message: "Failed to update password" });
    }

    return res.status(200).json({
      EC: 0,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error verifying OTP" });
  }
};

module.exports = { sendOtpForPasswordChange, verifyOtp };
