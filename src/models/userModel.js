const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
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
    role: {
      type: String,
      required: true,
      enum: ["admin", "host"],
    },
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
    otpSecret: String,
    otpCreatedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
