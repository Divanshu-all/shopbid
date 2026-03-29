const mongoose = require('mongoose');

const ShopSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  shopName: {
    type: String,
    required: [true, 'Shop name is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  photo: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: ['electronics', 'clothing', 'food', 'furniture', 'books', 'sports', 'other'],
    default: 'other',
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalRatings: {
    type: Number,
    default: 0,
  },
  upiId: {
    type: String,
    default: '',
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Shop', ShopSchema);
