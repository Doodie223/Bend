const propertiesModel = require("../../models/propertiesModel");
const userModel = require("../../models/userModel");
const uploadFile = require("../../services/uploadService");
const mime = require("mime-types");
const path = require("path");

let allowedMimeTypes = ["image/jpeg", "image/png"];

const getAllProperties = async (req, res) => {
  try {
    if (!req.user.user_id) {
      return res.status(401).json({
        EC: 1,
        message: "Host ID is required",
      });
    }
    const properties = await propertiesModel.find({
      host_id: req.user.user_id,
    });
    res.status(200).json({
      EC: 0,
      message: "Properties fetched successfully",
      data: properties,
    });
  } catch (error) {
    res.status(500).json({
      EC: 2,
      message: error.message,
    });
  }
};

const createProperty = async (req, res) => {
  try {
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

    // Validate required fields
    if (!name) missingFields.push("name");
    if (!description) missingFields.push("description");
    if (!req.files.images || req.files.images === 0)
      missingFields.push("images");
    if (!amenities) missingFields.push("amenities");
    if (!city) missingFields.push("city");

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

    const files = req.files.images;
    let images = "";
    if (Array.isArray(files)) {
      for (const file of files) {
        let mimeType = mime.lookup(file.name);
        if (!allowedMimeTypes.includes(mimeType)) {
          throw new Error(
            "Only image,files are allowed. Please check your file(s) (multiple)."
          );
        }
      }
      let result = await uploadFile.uploadMultipleFilesApi(files);
      images = result.message.DT.paths;
    }

    const newProperty = new propertiesModel({
      host_id: user._id,
      name,
      description,
      images: images,
      amenities,
      location: {
        city: city,
      },
      status: false,
      isCheck: false,
    });

    await newProperty.save();
    res.status(201).json({
      EC: 0,
      message: `Property ${newProperty.name} created successfully. Your request is processing`,
      data: newProperty,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Tìm property trước khi sử dụng
    const propertyBeforeUpdate = await propertiesModel.findById(id);
    if (!propertyBeforeUpdate) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Kiểm tra xem có bất kỳ thay đổi nào không
    const hasUpdates = Object.keys(updates).some(
      (key) => propertyBeforeUpdate[key] !== updates[key]
    );

    if (!hasUpdates) {
      return res.status(400).json({
        EC: 1,
        message: "No updates made to the property",
      });
    }

    // Cập nhật amenities nếu có
    if (updates.amenities) {
      propertyBeforeUpdate.amenities = updates.amenities;
    }

    // Cập nhật các trường khác
    Object.keys(updates).forEach((key) => {
      if (key !== "amenities") {
        propertyBeforeUpdate[key] = updates[key];
      }
    });

    // Lưu đối tượng đã cập nhật
    const updatedProperty = await propertyBeforeUpdate.save();

    res.status(200).json({ EC: 0, data: updatedProperty });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID từ params
    if (id === undefined) {
      return res.status(400).json({ message: "ID is required" });
    }
    // Xóa property với ID đã cho
    const deletedProperty = await propertiesModel.findByIdAndDelete(id);

    if (!deletedProperty) {
      return res.status(404).json({
        EC: 1,
        message: "Property not found",
      });
    }

    res.status(200).json({
      EC: 0,
      message: "Property deleted successfully",
      data: deletedProperty, // Trả về property đã xóa  trước khi xóa
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTypeRoomsByPropertyId = async (req, res) => {
  try {
    const { property_id } = req.params;

    // Kiểm tra xem property có tồn tại không
    const propertyExists = await propertiesModel.findById(property_id);
    if (!propertyExists) {
      return res.status(404).json({
        EC: 1,
        message: "Property not found",
      });
    }

    // Tìm tất cả các TypeRooms dựa trên property_id
    const typeRooms = await typeRoomModel.find({
      property_id: property_id,
    });

    if (typeRooms.length === 0) {
      return res.status(404).json({
        EC: 1,
        message: "No TypeRooms found for this property",
      });
    }

    res.status(200).json({
      EC: 0,
      message: "TypeRooms fetched successfully",
      data: typeRooms,
    });
  } catch (error) {
    console.error("Error fetching TypeRooms by property_id:", error);
    res.status(500).json({
      EC: 1,
      message: "Error fetching TypeRooms",
      error: error.message,
    });
  }
};
module.exports = {
  getAllProperties,
  createProperty,
  updateProperty,
  deleteProperty,
};
