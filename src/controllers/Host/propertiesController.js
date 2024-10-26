const propertiesModel = require("../../models/propertiesModel");
const userModel = require("../../models/userModel");

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

    const { name, description, images, amenities, city } = req.body;

    const missingFields = [];

    // Validate required fields
    if (!name) missingFields.push("name");
    if (!description) missingFields.push("description");
    if (!images) missingFields.push("images");
    if (!amenities) missingFields.push("amenities");
    if (!city) missingFields.push("city");
    // if (!location?.district) missingFields.push("District in Location");
    // if (!location?.ward) missingFields.push("Ward in Location");
    // if (!location?.address) missingFields.push("Address in Location");
    // if (!coordinates) missingFields.push("Coordinates");
    // if (typeof coordinates?.latitude !== "number")
    //   missingFields.push("Latitude (must be a number)");
    // if (typeof coordinates?.longitude !== "number")
    //   missingFields.push("Longitude (must be a number)");
    // Validate the incoming location and coordinates
    // if (!location || !coordinates) {
    //   return res.status(400).json({
    //     EC: 1,
    //     message: "Location and coordinates are required",
    //   });
    // }

    if (missingFields.length > 0) {
      return res.status(400).json({
        EC: 1,
        message: "Missing required fields: " + missingFields.join(", "),
      });
    }

    const user = await userModel.findById(req.user.user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newProperty = new propertiesModel({
      host_id: user._id,
      name,
      description,
      images,
      amenities,
      location: {
        city: city,
        // district: location.district,
        // ward: location.ward,
        // address: location.address,
      },
      // coordinates: {
      //   latitude: coordinates.latitude,
      //   longitude: coordinates.longitude,
      // },
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
