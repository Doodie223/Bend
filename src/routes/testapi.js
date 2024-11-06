const express = require("express");
const upload = require("../middlewares/cloudinaryMiddleware");
const { sendEmail, sendOtpMail } = require("../controllers/emailController");

const testAPI = express.Router();

testAPI.get("/", (req, res) => {
  return res.status(200).json({ message: "Welcome to Test API" });
});

testAPI.post(
  "/uploadTest",
  upload.fields([{ name: "image", maxCount: 5 }]),
  (req, res) => {
    try {
      if (!req.files || !req.files["image"]) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const link_img = req.files["image"].map((file) => file.path);
      res.send(link_img);
    } catch (error) {
      console.error(error);
      res.status(500).send("File upload error");
    }
  }
);

testAPI.post("/sendEmail", sendEmail);
testAPI.post("/sendOPTEmail", sendOtpMail);
module.exports = testAPI;
