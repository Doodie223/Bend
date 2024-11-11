const express = require("express");
const upload = require("../middlewares/cloudinaryMiddleware");
const { sendEmail, sendOtpMail } = require("../controllers/emailController");
const axios = require('axios').default; // npm install axios
const CryptoJS = require('crypto-js'); // npm install crypto-js
const moment = require('moment'); // npm install moment



const testAPI = express.Router();

testAPI.get("/", (req, res) => {
  return res.status(200).json({ message: "Welcome to Test API" });
});

testAPI.post(
  "/uploadTest",
  upload.fields([{ name: "image", maxCount: 5 }]),
  (req, res) => {
    try {
      if (!req.files || !req.files["image"]) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const link_img = req.files["image"].map((file) => file.path);
      res.send(link_img);
    } catch (error) {
      console.error(error);
      res.status(500).send("File upload error");
    }
  }
);

testAPI.post("/sendEmail", sendEmail);
testAPI.post("/sendOPTEmail", sendOtpMail);


//Test Payment
// APP INFO
const config = {
  app_id: "2553",
  key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
  key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
  endpoint: "https://sb-openapi.zalopay.vn/v2/create"
};

testAPI.post("/payment", async (req, res) => {
  const embed_data = {
    redirecturl: "https://example.com",
  };
  const amount = req.body.amount;
  if (!amount) {
    return res.status(400).json({ error: "Amount is required" });
  }
  const items = [{}];
  const transID = Math.floor(Math.random() * 1000000);
  const order = {
    app_id: config.app_id,
    app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
    app_user: "user123",
    app_time: Date.now(), // miliseconds
    item: JSON.stringify(items),
    embed_data: JSON.stringify(embed_data),
    amount: amount,
    description: `Lazada - Payment for the order #${transID}`,
    bank_code: "",
    callback_url: ""
  };

  // appid|app_trans_id|appuser|amount|apptime|embeddata|item
  const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
  order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

  try {
    const result = await axios.post(config.endpoint, null, { params: order });
    console.log("Payment result: ", result.data);
    return res.status(200).json(result.data);
  } catch (error) {
    console.log(error);
  }

})

testAPI.post('/callback', (req, res) => {
  let result = {};

  try {
    let dataStr = req.body.data;
    let reqMac = req.body.mac;

    let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
    console.log("mac =", mac);


    // kiểm tra callback hợp lệ (đến từ ZaloPay server)
    if (reqMac !== mac) {
      // callback không hợp lệ
      result.return_code = -1;
      result.return_message = "mac not equal";
    }
    else {
      // thanh toán thành công
      // merchant cập nhật trạng thái cho đơn hàng
      let dataJson = JSON.parse(dataStr, config.key2);
      console.log("update order's status = success where app_trans_id =", dataJson["app_trans_id"]);

      result.return_code = 1;
      result.return_message = "success";
    }
  } catch (ex) {
    result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
    result.return_message = ex.message;
  }

  // thông báo kết quả cho ZaloPay server
  res.json(result);
});

module.exports = testAPI;
