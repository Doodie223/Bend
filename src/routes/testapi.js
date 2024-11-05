const express = require("express");
const upload = require("../middlewares/cloudinaryMiddleware");

const testAPI = express.Router();

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

module.exports = testAPI;
