const fs = require("fs");
const path = require("path");
const { sendEmailService } = require("../services/emailService");

const sendEmail = async (req, res) => {
  try {
    const { email, subject, otp } = req.body;
    if (email) {
      const result = await sendEmailService(email, subject, otp);
      return res.json(result);
    }
    return res.status(400).json({ message: "Missing email" });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error sending email");
  }
};

const sendOtpMail = async (req, res) => {
  try {
    const { email, subject } = req.body;
    if (email) {
      const otp = Math.floor(100000 + Math.random() * 900000);
      let htmlContent = fs.readFileSync(
        path.join(__dirname, "../views/otpTemplate.html"),
        "utf-8"
      );
      htmlContent = htmlContent.replace("{{otp}}", otp);
      const text = `Your OTP code is ${otp}. This code will expire in 2 minutes.`;
      const result = await sendEmailService(email, subject, text, htmlContent);
      return res.json(result);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error sending otp email");
  }
};

module.exports = { sendEmail, sendOtpMail };
