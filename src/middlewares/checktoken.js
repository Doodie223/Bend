const jwt = require("jsonwebtoken");
require("dotenv").config();

const checkToken = (req, res, next) => {
  const white_list = ["/", "/register", "/login"];
  if (white_list.find((item) => "/v1/api" + item === req.originalUrl)) {
    next();
  } else {
    if (req.headers && req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      //verify token
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
          EC: 0,
          user_id: decoded._id,
          role: decoded.role,
          email: decoded.email,
          name: decoded.name,
        };
        next();
      } catch (error) {
        return res.status(401).json({
          EC: 1,
          message: "Please login to continues !!!",
        });
      }
    } else {
      return res
        .status(401)
        .json({ EC: 1, message: "Please login to continues !!!" });
    }
  }
};

const checkRoleHost = (req, res, next) => {
  if (req.user.role === "host") {
    next();
  } else {
    return res
      .status(403)
      .json({ EC: 1, message: "Access denied: Host role required" });
  }
};

module.exports = {
  checkToken,
  checkRoleHost,
};
