const express = require("express");
const { checkToken, checkRoleHost } = require("../middlewares/checktoken");
const {
  getAllProperties,
  createProperty,
  deleteProperty,
  updateProperty,
} = require("../controllers/Host/propertiesController");

const typeRoom = require("../controllers/Host/typeRoomController");

//Middelware
const upload = require("../middlewares/cloudinaryMiddleware");
const {
  validatePropertyCreation,
} = require("../middlewares/Host/propertiesMiddleWare");

const routerHostAPI = express.Router();
routerHostAPI.get("/", (req, res) => {
  return res.status(200).json({ message: "Welcome to Host API" });
});

// Delay middleware
routerHostAPI.all("*", checkToken, checkRoleHost);

// Manager properties
routerHostAPI.get("/allProperties", getAllProperties);
routerHostAPI.post(
  "/createProperties",
  upload.fields([{ name: "images", maxCount: 5 }]),
  createProperty
);
routerHostAPI.delete("/deleteProperty/:id", deleteProperty);
routerHostAPI.put("/editProperty/:id", updateProperty);

// Manager Rooms
routerHostAPI.post(
  "/createTypeRoom",
  upload.fields([{ name: "images", maxCount: 5 }]),
  typeRoom.createNewTypeRoom
);
routerHostAPI.get("/getAllTypeRoom", typeRoom.getAllTypeRooms);
routerHostAPI.get("/getListP", typeRoom.getListP);
routerHostAPI.get("/getRoomTypeByPId/:id", typeRoom.getTypeRoomById);

module.exports = routerHostAPI;
