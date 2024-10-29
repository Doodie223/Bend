const { createOtp } = require("../../services/verifyService");

const generateOtpForUser = async (req, res) => {
  try {
    const { otp, secret } = createOtp();

    // Trả về thông báo thành công
    res.status(200).json({
      message: "OTP generated successfully",
      otp,
      secret,
    });
  } catch (error) {
    console.error("Error generating OTP:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { generateOtpForUser };
