const UserS = require("../services/customerService");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const createNewUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Missing required fields name, email, password" });
    }

    //check user exits
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(200).json({
        EC: 1,
        EM: "Email already exists",
      });
    }

    const data = await UserS.createUserService(name, email, password);
    return res.status(200).json({
      message: "User created successfully",
      data,
    });
  } catch (error) {
    console.log(">> Error from createNewUser (Controller): ", error);
    return res
      .status(500)
      .json({ error: ">> Error from createNewUser (Controller): ", error });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(200).json({
        EC: 1,
        EM: "Email or Password is incorrect!",
      });
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(200).json({
        EC: 1,
        EM: "Email or Password is incorrect!",
      });
    }

    const isMatchPass = await bcrypt.compare(password, user.password);
    if (!isMatchPass) {
      return res.status(200).json({
        EC: 1,
        EM: "Email or Password is incorrect!",
      });
    }

    const payload = {
      _id: user._id,
      email: user.email,
      name: user.username,
      role: user.role,
    };

    const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
    return res.status(200).json({
      EC: 0,
      EM: "User logged in successfully",
      access_token,
      userId: user._id,
      role: user.role,
      name: user.username,
      email: user.email,
    });
  } catch (error) {
    console.log(">> Error from loginUser (Controller): ", error);
    return res.status(500).json({
      EC: 1, // Error code indicating failure
      EM: "An unexpected error occurred. Please try again later.",
    });
  }
};

const getAccount = async (req, res) => {
  return res.status(200).json(req.user);
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Kiểm tra xem người dùng có tồn tại không
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        EC: 1,
        EM: "User not found",
      });
    }

    // Tạo mã OTP
    const { otp, secret } = createOtp(); // Sử dụng hàm createOtp từ verifyService
    user.otpSecret = secret;
    user.otpCreatedAt = Date.now();
    await user.save();

    // Gửi mã OTP qua email
    const mailOptions = {
      from: process.env.EMAIL_FROM, // Địa chỉ email bạn muốn gửi từ
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({
          EC: 1,
          EM: "Error sending OTP email",
        });
      }
      return res.status(200).json({
        EC: 0,
        EM: "OTP sent successfully to your email",
      });
    });
  } catch (error) {
    console.log(">> Error from forgotPassword (Controller): ", error);
    return res.status(500).json({
      EC: 1,
      EM: "An unexpected error occurred. Please try again later.",
    });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        EC: 1,
        EM: "User not found",
      });
    }

    // Kiểm tra xem OTP đã hết hạn chưa
    if (Date.now() - user.otpCreatedAt > 5 * 60 * 1000) {
      // 5 phút
      return res.status(400).json({
        EC: 1,
        EM: "OTP has expired",
      });
    }

    // Kiểm tra OTP
    const isValid = checkOtp(otp, user.otpSecret);
    if (!isValid) {
      return res.status(400).json({
        EC: 1,
        EM: "Invalid OTP",
      });
    }

    // Mã hóa mật khẩu mới và cập nhật
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otpSecret = null;
    user.otpCreatedAt = null;
    await user.save();

    return res.status(200).json({
      EC: 0,
      EM: "Password reset successfully",
    });
  } catch (error) {
    console.log(">> Error from resetPassword (Controller): ", error);
    return res.status(500).json({
      EC: 1,
      EM: "An unexpected error occurred. Please try again later.",
    });
  }
};

module.exports = {
  createNewUser,
  loginUser,
  getAccount,
  forgotPassword,
  resetPassword,
};
