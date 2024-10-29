const speakeasy = require("speakeasy");

const createOtp = () => {
  const secret = speakeasy.generateSecret({ length: 20 });
  const otp = speakeasy.totp({
    secret: secret.base32,
    encoding: "base32",
  });

  return { otp, secret: secret.base32 };
};

module.exports = createOtp;
