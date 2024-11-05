const Properties = require("../models/propertiesModel");
const TypeRoom = require("../models/typeRoomModel");
const BookingModel = require("../models/bookingModel");
const { convertDateFormat } = require("../services/timeConvertService");
const {
  validateInputFields,
  getPropertiesWithRooms,
  getConflictingBookings,
  filterAvailableRooms,
  getHotelDetailsAndAvailableRooms,
} = require("../services/bookingService");

const findRoomAvaily = async (req, res) => {
  try {
    const { city, checkInDateStr, checkOutDateStr, numAdults, numChildren } =
      req.query;
    console.log("Check City: " + city);
    // Validate input fields
    const validationError = validateInputFields({
      city,
      checkInDateStr,
      checkOutDateStr,
      numAdults,
    });
    if (validationError) {
      return res.status(400).json(validationError);
    }
    const checkInDate = convertDateFormat(checkInDateStr);
    const checkOutDate = convertDateFormat(checkOutDateStr);

    // 1. Check hotel of City
    const findTypeRoomsByCity = await getPropertiesWithRooms(city);

    // 2. Check conflict booking with date
    const conflictingBookings = await getConflictingBookings(
      checkInDate,
      checkOutDate
    );
    console.log(conflictingBookings);
    // 3. Check available room not booked
    const availableRooms = filterAvailableRooms(
      findTypeRoomsByCity,
      conflictingBookings
    );
    return res.status(200).json({
      EC: 0,
      message: "Search room available",
      data: availableRooms,
    });
  } catch (error) {
    console.log("Error from findRoom (Controller): ", error);
    return res.status(500).json("Error: " + error.message);
  }
};

const getHotelDetails = async (req, res) => {
  try {
    const { hotelId, checkInDateStr, checkOutDateStr } = req.query;

    // Kiểm tra tham số đầu vào
    if (!hotelId || !checkInDateStr || !checkOutDateStr) {
      return res.status(400).json({
        EC: 1,
        message:
          "Missing required fields: hotelId, checkInDateStr, or checkOutDateStr",
      });
    }

    const checkInDate = convertDateFormat(checkInDateStr);
    const checkOutDate = convertDateFormat(checkOutDateStr);

    // Lấy thông tin chi tiết của khách sạn và các phòng còn trống
    const { hotelDetails, availableRooms } =
      await getHotelDetailsAndAvailableRooms(
        hotelId,
        checkInDate,
        checkOutDate
      );

    return res.status(200).json({
      EC: 0,
      message: "Hotel details retrieved successfully",
      hotelDetails,
      availableRooms,
    });
  } catch (error) {
    console.log("Error from getHotelDetails (Controller): ", error);
    return res.status(500).json("Error: " + error.message);
  }
};

const addBooking = async (req, res) => {
  const { checkInDateStr, checkOutDateStr, listRoom, typeRoomId, propertyId } =
    req.body;

  const checkInDate = convertDateFormat(checkInDateStr);
  const checkOutDate = convertDateFormat(checkOutDateStr);

  try {
    const newBooking = new BookingModel({
      checkInDate,
      checkOutDate,
      listRoom,
      typeRoomId,
      propertyId,
    });

    // Save the booking to the database
    await newBooking.save();
    return res
      .status(201)
      .json({ message: "Booking added successfully!", booking: newBooking });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { findRoomAvaily, addBooking, getHotelDetails };
