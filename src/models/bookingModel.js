const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Properties" },
    typeRoomId: { type: mongoose.Schema.Types.ObjectId, ref: "typeRoom" },
    listRoom: { type: [String] },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    checkInDate: { type: Date },
    checkOutDate: { type: Date },
    totalPrice: { type: Number },
    status: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", BookingSchema);
