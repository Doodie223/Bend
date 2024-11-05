const propertiesModel = require("../../models/propertiesModel");
const userModel = require("../../models/userModel");

const validatePropertyCreation = async (req, res, next) => {
  if (!req.user.user_id) {
    return res.status(404).json({
      EC: 1,
      message: "Host ID is required",
    });
  }

  const user = await userModel.findById(req.user.user_id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const { name, description, amenities, city } = req.body;

  const missingFields = [];

  // Kiểm tra các trường bắt buộc
  if (!name) missingFields.push("name");
  if (!description) missingFields.push("description");
  if (!amenities) missingFields.push("amenities");
  if (!city) missingFields.push("city");

  // Kiểm tra số lượng ảnh
  //   if (req.files.images && req.files.images.length < 5) {
  //     return res.status(400).json({
  //       EC: 1,
  //       message: "At least 5 images are required",
  //     });
  //   }

  if (missingFields.length > 0) {
    return res.status(400).json({
      EC: 1,
      message: "Missing required fields: " + missingFields.join(", "),
    });
  }

  const isExistName = await propertiesModel.findOne({ name: name });
  if (isExistName) {
    return res.status(400).json({
      EC: 1,
      message: "Property name already exists",
    });
  }

  next(); // Nếu tất cả kiểm tra thành công, tiếp tục đến middleware tiếp theo
};

module.exports = { validatePropertyCreation }; // Cài đặt middleware
