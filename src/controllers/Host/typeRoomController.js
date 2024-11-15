const typeRoomModel = require("../../models/typeRoomModel");
const propertiesModel = require("../../models/propertiesModel");

const createNewTypeRoom = async (req, res) => {
  try {
    const {
      property_id,
      typeOfRoom,
      listRoom,
      amenities,
      price,
      maxAdults,
      maxChildren,
      area,
    } = req.body;

    if (!property_id)
      return res
        .status(400)
        .json({ EC: 1, message: "Missing required property_id" });
    const checkProperties = await propertiesModel.findById(property_id);
    if (!checkProperties) {
      return res.status(404).json({
        EC: 1,
        message: "Property not found",
      });
    }

    const missingFields = [];
    if (!typeOfRoom) missingFields.push("typeOfRoom");
    if (!listRoom) missingFields.push("listRoom");
    if (!amenities) missingFields.push("amenities");
    if (!price) missingFields.push("price");
    if (!maxAdults) missingFields.push("maxAdults");
    if (!maxChildren) missingFields.push("maxChildren");
    if (!area) missingFields.push("area");

    if (missingFields.length > 0) {
      return res.status(400).json({
        EC: 1,
        message: "Missing required fields: " + missingFields.join(", "),
      });
    }

    const existingTypeRoom = await typeRoomModel.findOne({
      property_id,
      typeOfRoom,
    });

    if (existingTypeRoom) {
      return res.status(400).json({
        EC: 1,
        message: "A TypeRoom with the same property_id already exists",
      });
    }

    const images = req.files.images.map((file) => file.path);

    const newTypeRoom = new typeRoomModel({
      property_id,
      images,
      typeOfRoom,
      listRoom,
      amenities,
      price,
      maxAdults,
      maxChildren,
      area,
      status: false,
    });

    // Lưu vào database
    await newTypeRoom.save();

    res.status(201).json({
      EC: 0,
      message: "TypeRoom created successfully",
      data: newTypeRoom,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error creating TypeRoom",
      error: error.message,
    });
  }
};

const getListP = async (req, res, next) => {
  try {
    // Kiểm tra xem user_id có tồn tại không
    if (!req.user.user_id) {
      return res.status(401).json({
        EC: 1,
        message: "Host ID is required",
      });
    }

    // Tìm tất cả các properties dựa trên host_id
    const properties = await propertiesModel
      .find({
        host_id: req.user.user_id,
      })
      .select("_id name"); // Lấy cả _id và name

    // Kiểm tra xem có properties nào không
    if (!properties || properties.length === 0) {
      return res.status(404).json({
        EC: 1,
        message: "No properties found for the current user",
      });
    }

    // Trả về danh sách các properties với _id và name
    return res.status(200).json({
      EC: 0,
      message: "Get properties successfully",
      data: properties, // Trả về danh sách properties với _id và name
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error getting properties",
      error: error.message,
    });
  }
};

const getAllTypeRooms = async (req, res) => {
  try {
    if (!req.user.user_id) {
      return res.status(401).json({
        EC: 1,
        message: "Host ID is required",
      });
    }
    const properties = await propertiesModel
      .find({
        host_id: req.user.user_id,
      })
      .select("_id");
    if (!properties) {
      return res.status(404).json({
        EC: 1,
        message: "No properties found for the current user",
      });
    }
    const propertyIds = properties.map((property) => property._id);

    const typeRooms = await typeRoomModel.find({
      property_id: { $in: propertyIds },
    });

    res.status(200).json({
      message: "Fetched typeRooms successfully",
      data: typeRooms,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching TypeRooms",
      error: error.message,
    });
  }
};

const getTypeRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const typeRooms = await typeRoomModel.find({ property_id: id });
    res.status(200).json({
      EC: 0,
      message: "TypeRooms fetched successfully",
      data: typeRooms,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching TypeRoom",
      error: error.message,
    });
  }
};

const updateTypeRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedTypeRoom = await typeRoomModel.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );

    if (!updatedTypeRoom) {
      return res.status(404).json({
        message: "TypeRoom not found",
      });
    }

    res.status(200).json({
      message: "TypeRoom updated successfully",
      data: updatedTypeRoom,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating TypeRoom",
      error: error.message,
    });
  }
};

const deleteTypeRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTypeRoom = await typeRoomModel.findByIdAndDelete(id);

    if (!deletedTypeRoom) {
      return res.status(404).json({
        message: "TypeRoom not found",
      });
    }

    res.status(200).json({
      EC: 0,
      message: "TypeRoom deleted successfully",
      data: deletedTypeRoom,
    });
  } catch (error) {
    res.status(500).json({
      EC: 1,
      message: "Error deleting TypeRoom",
      error: error.message,
    });
  }
};

module.exports = {
  createNewTypeRoom,
  getAllTypeRooms,
  getTypeRoomById,
  updateTypeRoom,
  deleteTypeRoom,
  getListP,
};
