const mongoose = require("mongoose");

const typeRoomSchema = new mongoose.Schema(
  {
    property_id: { type: mongoose.Schema.Types.ObjectId, ref: "Properties" },
    images: { type: [String] },
    typeOfRoom: { type: String },
    listRoom: { type: [String] },
    amenities: { type: [String] },
    price: { type: Number },
    status: { type: Boolean },
    maxAdults: { type: Number, required: true },
    maxChildren: { type: Number, required: true },
    area: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("typeRoom", typeRoomSchema);
