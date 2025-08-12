const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pickupAddress: { type: String, required: true },
  dropoffAddress: { type: String, required: true },
  cylinderSize: { type: Number, enum: [2, 3, 5, 7], required: true },
  quantity: { type: Number, min: 1, required: true },
  returnTime: { type: Date, required: true },
  paymentType: { type: String, enum: ['subscription', 'pay-per-refill'], required: true },
  price: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
