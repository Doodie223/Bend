const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Properties" },
    userBookId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    listRoom: [
      {
        typeRoomId: { type: mongoose.Schema.Types.ObjectId, ref: "typeRoom" },
        room: [{ type: String }],
        price: { type: Number },
      },
    ],
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    totalPrice: { type: Number },
    isPayment: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "checked-in", "checked-out"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", BookingSchema);
