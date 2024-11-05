const cloudinary = require("../configs/cloudiaryConfig");

const UploadImage = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ EC: 1, EM: "No files uploaded" });
    }

    const images = Array.isArray(req.files) ? req.files : [req.files]; // Cập nhật ở đây
    const uploadImages = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.uploader.upload(images[i].path); // Cập nhật để sử dụng images[i].path
      uploadImages.push({
        url: result.secure_url,
        public_id: result.public_id,
      });
    }

    return res.status(200).json({
      EC: 0,
      EM: "Images uploaded successfully",
      data: uploadImages,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      EC: 1,
      EM: "Error uploading file",
      message: error.message,
    });
  }
};

module.exports = { UploadImage };
