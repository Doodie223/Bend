const User = require("../models/userModel");
const Properties = require("../models/propertiesModel");
const BookingModel = require("../models/bookingModel");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const createUserService = async (username, email, password) => {
  try {
    let hashedPassword = await bcrypt.hash(password, saltRounds);
    let result = await User.create({
      username,
      email,
      password: hashedPassword,
      role: "client",
    });
    return result;
  } catch (error) {
    console.log(">> Error from createUserService: ", error);
    return error.message;
  }
};

const findAvailableRooms = async (city, checkInDate, checkOutDate) => {
  try {
    console.log(">>checking ", city, checkInDate, checkOutDate);
    const findTypeRoomsByCity = await Properties.aggregate([
      {
        $match: { "location.city": city }, // Match properties in Hanoi
      },
      {
        $lookup: {
          from: "typerooms", // The name of the TypeRoom collection (pluralized)
          localField: "_id",
          foreignField: "property_id",
          as: "typeRooms", // The output array field name
        },
      },
      {
        $project: {
          name: 1, // Include property name
          location: 1, // Include location
          typeRooms: {
            $map: {
              input: "$typeRooms",
              as: "room",
              in: {
                _id: "$$room._id", // Include room ID
                images: "$$room.images", // Include images
                typeOfRoom: "$$room.typeOfRoom", // Include type of room
                listRoom: "$$room.listRoom", // Include list of rooms
                amenities: "$$room.amenities", // Include amenities
                price: "$$room.price", // Include price
                status: "$$room.status", // Include status
                maxAdults: "$$room.maxAdults", // Include max adults
                maxChildren: "$$room.maxChildren", // Include max children
                area: "$$room.area", // Include area
              },
            },
          },
        },
      },
    ]);

    const conflictingBookings = await BookingModel.find({
      $or: [
        {
          checkInDate: { $lt: new Date(checkOutDate) },
          checkOutDate: { $gt: new Date(checkInDate) },
        },
      ],
    });

    const availableRooms = findTypeRoomsByCity
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
    console.log(availableRooms);
    return availableRooms;
  } catch (error) {
    console.log(">> Error from findAvailableRooms: ", error);
    return error.message;
  }
};

module.exports = {
  createUserService,
  findAvailableRooms,
};
