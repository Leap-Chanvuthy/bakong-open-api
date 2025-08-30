const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true, required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: String,
        price: Number,
        quantity: Number,
      }
    ],
    amount: { type: Number, required: true },
    currency: { type: String, default: 'KHR' },
    qr: String,
    md5: String,
    paid: { type: Boolean, default: false },
    bakongHash: String,
    fromAccountId: String,
    toAccountId: String,
    paidAt: Date,
    expiration: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
