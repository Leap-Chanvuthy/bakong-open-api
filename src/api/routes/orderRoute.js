const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.post("/create", orderController.createOrder);
router.post("/check-payment", orderController.checkOrderPayment);
router.get("/:orderId", orderController.getOrderInfo);

module.exports = router;
