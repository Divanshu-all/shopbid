const Bid = require('../models/Bid');
const Product = require('../models/Product');
const User = require('../models/User');
const { sendOutbidEmail } = require('../utils/mailer');

// @POST /api/bids/:productId — place a bid
const placeBid = async (req, res) => {
  try {
    const { amount } = req.body;
    const product = await Product.findById(req.params.productId);

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.status !== 'active') return res.status(400).json({ success: false, message: 'Auction is not active' });
    if (new Date() > product.endsAt) return res.status(400).json({ success: false, message: 'Auction has ended' });

    // Block users who failed to pay — permanently disqualified from this auction
    const isBlacklisted = product.paymentAttempts?.some(id => id.toString() === req.user._id.toString());
    if (isBlacklisted) {
      return res.status(403).json({ success: false, message: 'You failed to complete payment on this auction and are no longer eligible to bid.' });
    }
    const bidAmount = parseFloat(amount);
    if (bidAmount <= product.currentBid) {
      return res.status(400).json({ success: false, message: `Bid must be higher than ₹${product.currentBid}` });
    }

    // Check if current winner is the same user (they're already winning)
    if (product.currentWinner && product.currentWinner.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You are already the highest bidder' });
    }

    // Get previous winner before updating (for outbid email)
    const previousWinnerId = product.currentWinner;

    // Save bid
    const bid = await Bid.create({
      product: product._id,
      bidder: req.user._id,
      amount: bidAmount,
    });

    // Snipe protection — if bid placed within last 2 minutes, extend by 3 minutes
    const timeLeft = product.endsAt - new Date();
    let extended = false;
    if (timeLeft < 2 * 60 * 1000) {
      product.endsAt = new Date(product.endsAt.getTime() + 3 * 60 * 1000);
      extended = true;
    }

    // Update product
    product.currentBid = bidAmount;
    product.currentWinner = req.user._id;
    product.bidCount += 1;
    await product.save();

    const io = req.app.get('io');
    const room = `product_${product._id}`;

    // Broadcast new bid to everyone in the room
    if (io) {
      io.to(room).emit('bid_updated', {
        productId: product._id,
        currentBid: bidAmount,
        bidCount: product.bidCount,
        winnerId: req.user._id,
        winnerName: req.user.name,
        endsAt: product.endsAt,
        extended,
      });

      if (extended) {
        io.to(room).emit('timer_extended', { productId: product._id, newEndsAt: product.endsAt });
      }
    }

    // Notify previous winner they've been outbid (async, don't block response)
    if (previousWinnerId) {
      User.findById(previousWinnerId).then((prevUser) => {
        if (prevUser) {
          // Emit socket event to notify outbid user
          if (io) {
            io.to(room).emit('outbid_alert', {
              productId: product._id,
              outbidUserId: previousWinnerId,
              currentBid: bidAmount,
            });
          }
          // Send email (non-blocking)
          sendOutbidEmail({
            to: prevUser.email,
            buyerName: prevUser.name,
            productTitle: product.title,
            currentBid: bidAmount,
            productId: product._id,
          }).catch(console.error);
        }
      });
    }

    res.status(201).json({ success: true, bid, currentBid: bidAmount, extended, endsAt: product.endsAt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/bids/:productId — get all bids for a product
const getProductBids = async (req, res) => {
  try {
    const bids = await Bid.find({ product: req.params.productId })
      .sort({ amount: -1 })
      .populate('bidder', 'name');
    res.json({ success: true, bids });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/bids/my — buyer's own bid history
const getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ bidder: req.user._id })
      .sort({ createdAt: -1 })
      .populate({ path: 'product', select: 'title imageURL currentBid status endsAt', populate: { path: 'shop', select: 'shopName' } });
    res.json({ success: true, bids });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { placeBid, getProductBids, getMyBids };
