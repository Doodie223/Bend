const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const checkToken = require("../middlewares/checktoken");
const bookingController = require("../controllers/bookingController");
const { UploadImage } = require("../controllers/cloudinaryController");

const upload = require("../middlewares/cloudinaryMiddleware");

const makeOtp = require("../services/verifyService");
const { generateOtpForUser } = require("../controllers/Auth/verifyController");

const routerAPI = express.Router();

routerAPI.get("/", (req, res) => {
  return res.status(200).json({ message: "Welcome to API" });
});

routerAPI.get("/testotp", generateOtpForUser);

// ----------- Booking logic --------------------
routerAPI.get("/booking", bookingController.findRoomAvaily);

routerAPI.post("/addBooking", bookingController.addBooking);

routerAPI.post("/register", authController.createNewUser);
routerAPI.post("/login", authController.loginUser);

// Delay middleware
routerAPI.all("*", checkToken.checkToken);

routerAPI.get("/account", authController.getAccount);
//Users api

routerAPI.get("/getAllUsers", userController.getAllUsers);
routerAPI.get("/users/:userId", userController.getUsers);
//routerAPI.delete("/deleteUser/:id", authController.deleteUser);

module.exports = routerAPI; //export default
