const Properties = require("../models/propertiesModel");
const TypeRoom = require("../models/typeRoomModel");
const BookingModel = require("../models/bookingModel");
const { convertDateFormat } = require("../services/timeConvertService");
const {
  validateInputFields,
  getPropertiesWithRooms,
  getConflictingBookings,
  filterAvailableRooms,
  calculateNumberOfNights,
  suggestRooms,
} = require("../services/bookingService");

const findRoomAvaily = async (req, res) => {
  try {
    const { city, checkInDateStr, checkOutDateStr, numAdults, numChildren } =
      req.body;

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
    // 3. Check available room not booked
    const availableRooms = filterAvailableRooms(
      findTypeRoomsByCity,
      conflictingBookings
    );
    const numberOfNights = calculateNumberOfNights(checkInDate, checkOutDate);
    let remainingAdults = parseInt(numAdults, 10) || 0;
    let remainingChildren = parseInt(numChildren, 10) || 0;

    // 4. Check room can ok with customer
    const suggestedHotels = suggestRooms(
      remainingAdults,
      remainingChildren,
      availableRooms,
      numberOfNights
    );
    return res.status(200).json({
      numberOfNights,
      remainingAdults,
      remainingChildren,
      conflictingBookings,
      availableRooms,
      suggestedHotels,
    });
  } catch (error) {
    console.log("Error from findRoom (Controller): ", error);
    return res.status(500).json("Error: " + error.message);
  }
};

const addBooking = async (req, res) => {
  const { checkInDateStr, checkOutDateStr, listRoom, typeRoomId, hotelId } =
    req.body;

  const checkInDate = convertDateFormat(checkInDateStr);
  const checkOutDate = convertDateFormat(checkOutDateStr);

  try {
    const newBooking = new BookingModel({
      checkInDate,
      checkOutDate,
      listRoom,
      typeRoomId,
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

module.exports = { findRoomAvaily, addBooking };
