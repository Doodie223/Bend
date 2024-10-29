const Properties = require("../models/propertiesModel");
const TypeRoom = require("../models/typeRoomModel");
const BookingModel = require("../models/bookingModel");

const validateInputFields = ({
  city,
  checkInDateStr,
  checkOutDateStr,
  numAdults,
}) => {
  const missingFields = [];
  if (!city) missingFields.push("city");
  if (!checkInDateStr) missingFields.push("checkInDateStr");
  if (!checkOutDateStr) missingFields.push("checkOutDateStr");
  if (!numAdults) missingFields.push("numAdults");

  if (missingFields.length > 0) {
    return {
      EC: 1,
      message: "Missing required fields: " + missingFields.join(", "),
    };
  }
  return null;
};

// Get properties with rooms based on city
const getPropertiesWithRooms = async (city) => {
  return await Properties.aggregate([
    {
      $match: { "location.city": city },
    },
    {
      $lookup: {
        from: "typerooms",
        localField: "_id",
        foreignField: "property_id",
        as: "typeRooms",
      },
    },
    {
      $project: {
        name: 1,
        location: 1,
        typeRooms: {
          $map: {
            input: "$typeRooms",
            as: "room",
            in: {
              _id: "$$room._id",
              images: "$$room.images",
              typeOfRoom: "$$room.typeOfRoom",
              listRoom: "$$room.listRoom",
              amenities: "$$room.amenities",
              price: "$$room.price",
              status: "$$room.status",
              maxAdults: "$$room.maxAdults",
              maxChildren: "$$room.maxChildren",
              area: "$$room.area",
            },
          },
        },
      },
    },
  ]);
};

// Get conflicting bookings
const getConflictingBookings = async (checkInDate, checkOutDate) => {
  return await BookingModel.find({
    $or: [
      {
        checkInDate: { $lt: new Date(checkOutDate) },
        checkOutDate: { $gt: new Date(checkInDate) },
      },
    ],
  });
};

// Filter available rooms based on conflicting bookings
const filterAvailableRooms = (properties, conflictingBookings) => {
  return properties
    .map((property) => ({
      ...property,
      typeRooms: property.typeRooms.flatMap((room) => {
        const availableListRoom = room.listRoom.filter(
          (roomName) =>
            !conflictingBookings.some((booking) =>
              booking.listRoom.includes(roomName)
            )
        );
        return availableListRoom.length > 0
          ? [{ ...room, listRoom: availableListRoom }]
          : [];
      }),
    }))
    .filter((property) => property.typeRooms.length > 0);
};

// Calculate the number of nights between two dates
const calculateNumberOfNights = (checkInDate, checkOutDate) => {
  return (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24);
};

function suggestRooms(numAdults, numChildren, availableRooms, numNights) {
  const suggestedHotels = [];

  availableRooms.forEach((hotel) => {
    const hotelSuggestion = {
      hotelName: hotel.name,
      location: hotel.location.city,
      numberOfNights: numNights,
      roomTypes: [],
      totalCost: 0,
    };

    let remainingAdults = numAdults;
    let remainingChildren = numChildren;

    hotel.typeRooms.forEach((room) => {
      if (
        room.maxAdults >= remainingAdults &&
        room.maxChildren >= remainingChildren
      ) {
        hotelSuggestion.roomTypes.push({
          type: room.typeOfRoom,
          quantity: 1,
          pricePerNight: room.price,
          totalPrice: room.price * numNights,
        });
        hotelSuggestion.totalCost += room.price * numNights;
        remainingAdults = 0;
        remainingChildren = 0;
      }
    });

    if (hotelSuggestion.roomTypes.length > 0) {
      suggestedHotels.push(hotelSuggestion);
    }
  });

  return suggestedHotels;
}

module.exports = {
  validateInputFields,
  getPropertiesWithRooms,
  getConflictingBookings,
  filterAvailableRooms,
  calculateNumberOfNights,
  suggestRooms,
};