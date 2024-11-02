const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: "client",
    phone: {
      type: String,
      required: false,
      trim: true,
    },
    is_active: {
      type: Boolean,
      default: false,
    },
    is_ban: {
      type: Boolean,
      default: false,
    },
    resetToken: String,
    resetTokenExpire: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", clientSchema);
