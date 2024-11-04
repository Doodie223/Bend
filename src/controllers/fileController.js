const uploadFile = require("../services/uploadService");
const mime = require("mime-types");
const path = require("path");

let allowedMimeTypes = ["image/jpeg", "image/png"];

const postUploadSingleFile = async (req, res) => {
  if (!req.files || Object.keys(req.files.file).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }
  let mimeType = mime.lookup(req.files.file.name);

  if (!allowedMimeTypes.includes(mimeType)) {
    throw new Error(
      "Only image, Word, and PDF files are allowed. Please check your file(s) (single)."
    );
  }
  let rl = await uploadFile.uploadSingleFile(req.files.file);
  return rl;
  //   return res.status(200).json({
  //     EC: "ok",
  //   });
};

const postUploadMultipleFiles = async (req, res) => {
  try {
    // Kiểm tra nếu không có files nào được upload
    if (!req.files || !req.files.file) {
      return res.status(400).send("No files were uploaded.");
    }

    const files = req.files.file;

    // Kiểm tra xem files là một mảng hay một file đơn lẻ
    if (Array.isArray(files)) {
      for (const file of files) {
        let mimeType = mime.lookup(file.name);
        if (!allowedMimeTypes.includes(mimeType)) {
          throw new Error(
            "Only image, Word, and PDF files are allowed. Please check your file(s) (multiple)."
          );
        }
      }
      let result = await uploadFile.uploadMultipleFilesApi(files);
      return res.status(result.status).json(result.message);
    } else {
      const result = await postUploadSingleFile(req, res);
      console.log(result);
      return res.status(result.status).json(result.message);
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("An error occurred while uploading the files.");
  }
};

const uploadImage = async (req, res) => {
  console.log(req.files);
  if (
    !req.files ||
    !req.files.image ||
    Object.keys(req.files.image).length === 0
  ) {
    return res.status(400).send("No files were uploaded.");
  }

  const image = req.files.image;

  // Check if the file is an image
  const allowedImageTypes = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
  if (!allowedImageTypes.test(path.extname(image.name))) {
    return res.status(400).json({
      EM: "Only image files are allowed (JPEG, JPG, PNG, GIF)",
      EC: 1,
    });
  }

  try {
    let result = await uploadFile.uploadImageUser(image);
    console.log("Image uploaded successfully:", result);
    return res.status(200).json(result);
  } catch (error) {
    console.log("Error uploading image:", error);
    return res.status(500).json({
      EM: "An error occurred while uploading the image",
      EC: 1,
    });
  }
};

module.exports = {
  postUploadSingleFile,
  postUploadMultipleFiles,
  uploadImage,
};
