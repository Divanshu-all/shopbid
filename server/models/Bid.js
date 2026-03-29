const mongoose = require('mongoose');

const BidSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  bidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
  },
}, { timestamps: true });

BidSchema.index({ product: 1, amount: -1 });

module.exports = mongoose.model('Bid', BidSchema);
