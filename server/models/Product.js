const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true,
  },
  title: { type: String, required: [true, 'Product title is required'], trim: true },
  description: { type: String, default: '' },
  imageURL: { type: String, required: [true, 'Product image is required'] },
  imagePublicId: { type: String, default: '' },
  startPrice: { type: Number, required: [true, 'Starting price is required'], min: 1 },
  buyNowPrice: { type: Number, default: null },
  currentBid: { type: Number, default: 0 },
  currentWinner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  bidCount: { type: Number, default: 0 },
  endsAt: { type: Date, required: true },
  duration: { type: Number, required: true },
  status: {
    type: String,
    enum: ['active', 'payment_pending', 'sold', 'void'],
    default: 'active',
  },
  category: {
    type: String,
    enum: ['electronics', 'clothing', 'food', 'furniture', 'books', 'sports', 'other'],
    default: 'other',
  },
  views: { type: Number, default: 0 },

  // Payment flow fields
  paymentWinner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  paymentDeadline: { type: Date, default: null },
  paymentAttempts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // users who failed to pay
  paymentConfirmedBySeller: { type: Boolean, default: false },
  paymentConfirmedByBuyer:  { type: Boolean, default: false },

  // Transaction code verification
  txnCode:        { type: String, default: null }, // generated unique code shown to buyer
  txnCodeEntered: { type: String, default: null }, // code buyer submits after paying
}, { timestamps: true });

ProductSchema.index({ status: 1, endsAt: 1 });

module.exports = mongoose.model('Product', ProductSchema);
