const Properties = require("../models/propertiesModel");
const typeRoom = require("../models/typeRoomModel");
const BookingModel = require("../models/bookingModel");
const { convertDateFormat } = require("../services/timeConvertService");

const findRoomAvaily = async (req, res) => {
  try {
    const {
      city,
      checkInDateStr,
      checkOutDateStr,
      numAdults,
      numChildren,
      numRooms,
    } = req.body;

    const missingFields = [];
    if (!city) missingFields.push("city");
    if (!checkInDateStr) missingFields.push("checkInDateStr");
    if (!checkOutDateStr) missingFields.push("checkOutDateStr");
    if (!numAdults) missingFields.push("numAdults");

    if (missingFields.length > 0) {
      return res.status(400).json({
        EC: 1,
        message: "Missing required fields: " + missingFields.join(", "),
      });
    }

    const checkInDate = convertDateFormat(checkInDateStr);
    const checkOutDate = convertDateFormat(checkOutDateStr);
    // Bước 1: Tìm bất động sản theo thành phố
    const properties = await Properties.find({ "location.city": city });
    console.log(properties);
    const result = [];

    for (const property of properties) {
      // Bước 2: Lấy tất cả kiểu phòng của bất động sản này
      const typeRooms = await typeRoom.find({ property_id: property._id });
      console.log(typeRooms);
      for (const typeRoom of typeRooms) {
        // Bước 3: Kiểm tra các phòng đã đặt
        const bookedRooms = await BookingModel.find({
          typeRoomId: typeRoom._id,
          checkInDate: { $lt: checkOutDate },
          checkOutDate: { $gt: checkInDate },
        });

        // Lấy danh sách các phòng đã đặt
        const bookedRoomList = bookedRooms.flatMap(
          (booking) => booking.listRoom
        );

        // Bước 4: Lọc phòng còn trống
        const availableRooms = typeRoom.listRoom.filter(
          (room) => !bookedRoomList.includes(room)
        );

        // Bước 5: Kiểm tra số phòng còn trống có đáp ứng yêu cầu không
        if (availableRooms.length >= numRooms) {
          result.push({
            propertyId: property._id,
            propertyName: property.name,
            typeRoomId: typeRoom._id,
            typeOfRoom: typeRoom.typeOfRoom,
            availableRooms: availableRooms,
            price: typeRoom.price,
            maxAdults: typeRoom.maxAdults,
            maxChildren: typeRoom.maxChildren,
          });
        }
      }
    }

    return res.status(200).json(result);
  } catch (error) {
    console.log("Error from findRoomAvaily (Controller): ", error);
    return res.status(500).json("Error: " + error.message);
  }
};

module.exports = {
  findRoomAvaily,
};
