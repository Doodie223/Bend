const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const cloudinary = require("../configs/cloudiaryConfig");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  folder: "restnest",
  allowedFormats: ["jpg", "png", "jpeg"],
  transformation: [{ width: 500, height: 500, crop: "limit" }],
});

// Tạo middleware multer với CloudinaryStorage
const upload = multer({ storage: storage });

module.exports = upload;
