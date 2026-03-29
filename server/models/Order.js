const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  buyer:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  shop:    { type: mongoose.Schema.Types.ObjectId, ref: 'Shop',    required: true },
  finalAmount: { type: Number, required: true },
  qrCode:  { type: String, required: true },
  orderId: { type: String, unique: true, required: true },

  paymentStatus: {
    type: String,
    enum: ['awaiting_payment', 'paid', 'confirmed_by_seller', 'pickedup'],
    default: 'awaiting_payment',
  },

  // Pickup confirmation — both must confirm
  confirmedBySeller: { type: Boolean, default: false },
  confirmedByBuyer:  { type: Boolean, default: false },

  // Legacy field kept for compatibility
  status: {
    type: String,
    enum: ['pending', 'pickedup'],
    default: 'pending',
  },

  pickedUpAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
