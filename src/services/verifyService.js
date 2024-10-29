const speakeasy = require("speakeasy");

const createOtp = () => {
  const secret = speakeasy.generateSecret({ length: 20 });
  const otp = speakeasy.totp({
    secret: secret.base32,
    encoding: "base32",
    expiresIn: 2 * 60 * 1000,
  });

  return { otp, secret: secret.base32 };
};

const checkOtp = (otp, secret) => {
  const isValid = speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token: otp,
    window: 1,
  });

  return isValid;
};

module.exports = { createOtp, checkOtp };
