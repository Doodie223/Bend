const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmailService = async (email, subject, text, htmlContent) => {
  const transporter = nodemailer.createTransport({
    // host: "smtp.gmail.com",
    // port: 587,
    // secure: false, // true for port 465, false for other ports
    // auth: {
    //   user: process.env.EMAIL_USERNAME,
    //   pass: process.env.EMAIL_PASSWORD,
    // },
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "aa350e9d882c5e",
      pass: "cbfbcaa2d6893f",
    },
  });

  const info = await transporter.sendMail({
    from: '"Rent Nest System" <noreply@rentnest.com>',
    to: email, // list of receivers
    subject: subject,
    text: text,
    html: htmlContent,
  });

  return info;
};

module.exports = {
  sendEmailService,
};
