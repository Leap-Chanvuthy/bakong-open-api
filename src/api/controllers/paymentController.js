const { BakongKHQR, khqrData, IndividualInfo } = require("bakong-khqr");
const Order = require('../models/Payment');
const { successResponse, errorResponse } = require('../../helpers/responseHelper');
const axios = require('axios');

const BAKONG_BASE_URL = process.env.BAKONG_PROD_BASE_API_URL;
const BAKONG_ACCESS_TOKEN = process.env.BAKONG_ACCESS_TOKEN;

const generateOrderID = async () => {
    // Find the latest order to generate a new orderId
    const latestOrder = await Order.findOne().sort({ createdAt: -1 });

    let newOrderNumber = 1;
    if (latestOrder && latestOrder.orderId) {
        // Extract number from ORDER_00001
        const lastNumber = parseInt(latestOrder.orderId.split('_')[1], 10);
        newOrderNumber = lastNumber + 1;
    }

    // Format orderId (ORDER_00001, ORDER_00002, ...)
    return `ORDER_${String(newOrderNumber).padStart(5, '0')}`;
};



exports.generateKHQR = async (req, res) => {
  try {
    const orderId = await generateOrderID();

    const expirationTimestamp = Date.now() + 5 * 60 * 1000; // 5 mins

    const optionalData = {
      currency: khqrData.currency.khr,
      amount: 100,
      expirationTimestamp,
    };

    const individualInfo = new IndividualInfo(
      process.env.BAKONG_ACCOUNT_USERNAME,
      "Chanvuthy Leap", // Update to your username
      "PHNOM PENH",  // Update to your city
      optionalData
    );

    const khqr = new BakongKHQR();
    const qrData = khqr.generateIndividual(individualInfo);

    const order = await Order.findOneAndUpdate(
      { orderId },
      {
        orderId,
        qr: qrData.data.qr,
        md5: qrData.data.md5,
        expiration: expirationTimestamp,
        paid: false,
        amount: 100,
        currency: 'KHR',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return successResponse(res, 'QR generated successfully', {
      orderId: order.orderId,
      qr: order.qr,
      md5: order.md5,
      expiresAt: order.expiration,
    });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 'Internal error', err);
  }
};




// Check Payment Controller
exports.checkPayment = async (req, res) => {
    try {
        const { md5 } = req.body;

        if (!md5) return res.status(400).json({ message: 'md5 is required' });

        // Find order by MD5
        const order = await Order.findOne({ md5 });
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Call Bakong API to check payment
        const response = await axios.post(`${BAKONG_BASE_URL}/check_transaction_by_md5`, { md5: order.md5 }, {
            headers: {
                Authorization: `Bearer ${BAKONG_ACCESS_TOKEN}`,
            }
        }
        );

        const data = response.data;

        if (data.responseCode === 0 && data.data?.hash) {
            // Update order with Bakong response fields
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

            return res.json({
                message: 'Payment confirmed',
                orderId: order.orderId,
                bakongHash: data.data.hash,
                bakongData: data.data
            });
        } else {
            return res.status(400).json({
                message: 'Payment not found or not completed',
                bakongData: data.data || null,
            });
        }
    } catch (err) {
        console.error(err.response?.data || err.message);
        res.status(500).json({ message: 'Internal error', error: err.message });
    }
}

exports.getOrderInfo = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Internal error', error: err.message });
  }
};
