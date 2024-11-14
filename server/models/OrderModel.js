const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  addressId: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
    },
  ],
  totalPrice: { type: Number, required: true },
  shippingCost: { type: Number, required: true, default: 0 },
  shippingOption: {
    service: { type: String, required: true },
    description: { type: String, required: true },
    cost: [
      {
        value: { type: Number, required: true },
        etd: { type: String, required: true },
        note: { type: String, default: "" },
      },
    ],
  },
  trackingCode: { type: String, },
  selectedShippingCode: { type: String, },
  status: { type: String, enum: ['pending', 'process', 'ondelivery', 'completed', 'cancelled'], default: 'pending' },
  paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
  paymentProof: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
