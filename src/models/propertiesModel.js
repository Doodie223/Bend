const mongoose = require("mongoose");

const PropertiesSchema = new mongoose.Schema(
  {
    host_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String },
    description: { type: String },
    images: { type: [String] },
    amenities: { type: [String] },
    location: {
      city: { type: String },
      state: { type: String },
      ward: { type: String },
      address: { type: String },
    },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    status: { type: Boolean },
    isCheck: { type: Boolean },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Properties", PropertiesSchema);
