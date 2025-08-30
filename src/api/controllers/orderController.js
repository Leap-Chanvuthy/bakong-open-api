const { BakongKHQR, khqrData, IndividualInfo } = require("bakong-khqr");
const {mongoose} = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { successResponse, errorResponse } = require("../../helpers/responseHelper");
const axios = require("axios");

const BAKONG_BASE_URL = process.env.BAKONG_PROD_BASE_API_URL;
const BAKONG_ACCESS_TOKEN = process.env.BAKONG_ACCESS_TOKEN;

// Generate new orderId
const generateOrderID = async () => {
  const latestOrder = await Order.findOne().sort({ createdAt: -1 });
  let newOrderNumber = 1;
  if (latestOrder && latestOrder.orderId) {
    const lastNumber = parseInt(latestOrder.orderId.split('_')[1], 10);
    newOrderNumber = lastNumber + 1;
  }
  return `ORDER_${String(newOrderNumber).padStart(5, '0')}`;
};

// Create Order + Generate KHQR
exports.createOrder = async (req, res) => {
  try {
    const { items } = req.body; // items = [{ productId, quantity }]

    if (!items || items.length === 0) return errorResponse(res, "No items provided", null, 400);

    // Fetch product details from DB
    const populatedItems = [];
    for (const item of items) {
    if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        return errorResponse(res, `Invalid productId: ${item.productId}`, null, 400);
    }

    const product = await Product.findById(item.productId);
    if (!product) return errorResponse(res, `Product not found: ${item.productId}`, null, 404);

    populatedItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
    });
    }

    // Calculate total amount
    const totalAmount = populatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const orderId = await generateOrderID();
    const expirationTimestamp = Date.now() + 5 * 60 * 1000; // 5 mins

    const optionalData = {
      currency: khqrData.currency.khr,
      amount: totalAmount,
      expirationTimestamp,
    };

    const individualInfo = new IndividualInfo(
      process.env.BAKONG_ACCOUNT_USERNAME,
      "Chanvuthy Leap",
      "PHNOM PENH",
      optionalData
    );

    const khqr = new BakongKHQR();
    const qrData = khqr.generateIndividual(individualInfo);

    const order = await Order.findOneAndUpdate(
      { orderId },
      {
        orderId,
        items: populatedItems,
        qr: qrData.data.qr,
        md5: qrData.data.md5,
        expiration: expirationTimestamp,
        amount: totalAmount,
        currency: 'KHR',
        paid: false,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return successResponse(res, "Order created and QR generated", {
      orderId: order.orderId,
      qr: order.qr,
      md5: order.md5,
      amount: order.amount,
      expiresAt: order.expiration,
    });
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to create order", err);
  }
};

// Check payment (same as before)
exports.checkOrderPayment = async (req, res) => {
  try {
    const { md5 } = req.body;
    if (!md5) return errorResponse(res, "md5 is required", null, 400);

    const order = await Order.findOne({ md5 });
    if (!order) return errorResponse(res, "Order not found", null, 404);

    const response = await axios.post(
      `${BAKONG_BASE_URL}/check_transaction_by_md5`,
      { md5: order.md5 },
      { headers: { Authorization: `Bearer ${BAKONG_ACCESS_TOKEN}` } }
    );

    const data = response.data;

    if (data.responseCode === 0 && data.data?.hash) {
      await Order.updateOne(
        { _id: order._id },
        {
          bakongHash: data.data.hash,
          fromAccountId: data.data.fromAccountId,
          toAccountId: data.data.toAccountId,
          currency: data.data.currency,
          amount: data.data.amount,
          description: data.data.description,
          externalRef: data.data.externalRef,
          createdDateMs: data.data.createdDateMs,
          acknowledgedDateMs: data.data.acknowledgedDateMs,
          trackingStatus: data.data.trackingStatus,
          receiverBank: data.data.receiverBank,
          receiverBankAccount: data.data.receiverBankAccount,
          instructionRef: data.data.instructionRef,
          paid: true,
          paidAt: new Date(),
        }
      );

      return successResponse(res, "Payment confirmed", {
        orderId: order.orderId,
        bakongHash: data.data.hash,
        bakongData: data.data,
      });
    } else {
      return errorResponse(res, "Payment not found or not completed", data.data || null, 400);
    }
  } catch (err) {
    console.error(err.response?.data || err.message);
    return errorResponse(res, "Internal error", err);
  }
};

// Get order info
exports.getOrderInfo = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return errorResponse(res, "Order not found", null, 404);
    return successResponse(res, "Order fetched successfully", order);
  } catch (err) {
    return errorResponse(res, "Failed to fetch order", err);
  }
};
