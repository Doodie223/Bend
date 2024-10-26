const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Properties" },
    typeRoomId: { type: mongoose.Schema.Types.ObjectId, ref: "typeRoom" },
    userBookId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    listRoom: { type: [String] },
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
