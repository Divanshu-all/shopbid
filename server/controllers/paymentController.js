const Product = require('../models/Product');
const Order = require('../models/Order');
const Shop = require('../models/Shop');
const Bid = require('../models/Bid');
const { finalizeOrder } = require('../utils/auctionCron');

// @POST /api/payment/:productId/pay — buyer marks payment made + submits txnCode
const markPaymentMade = async (req, res) => {
  try {
    const { txnCode } = req.body;
    if (!txnCode) return res.status(400).json({ success: false, message: 'Transaction code is required' });

    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.status !== 'payment_pending') return res.status(400).json({ success: false, message: 'No payment pending for this product' });
    if (product.paymentWinner?.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'You are not the current payment winner' });
    if (new Date() > product.paymentDeadline)
      return res.status(400).json({ success: false, message: 'Payment window has expired' });

    // Validate txnCode matches
    if (txnCode.trim().toUpperCase() !== product.txnCode) {
      return res.status(400).json({ success: false, message: 'Transaction code does not match. Please enter the exact code shown to you.' });
    }

    await Product.findByIdAndUpdate(req.params.productId, {
      paymentConfirmedByBuyer: true,
      txnCodeEntered: txnCode.trim().toUpperCase(),
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`product_${product._id}`).emit('payment_made_by_buyer', {
        productId: product._id,
        buyerId: req.user._id,
        buyerName: req.user.name,
        amount: product.currentBid,
        txnCode: txnCode.trim().toUpperCase(),
      });
    }

    res.json({ success: true, message: 'Payment confirmed. Waiting for seller to verify.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/payment/:productId/confirm — seller confirms payment received
const confirmPaymentBySeller = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });

    const product = await Product.findOne({ _id: req.params.productId, shop: shop._id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found in your shop' });
    if (product.status !== 'payment_pending') return res.status(400).json({ success: false, message: 'No payment pending' });

    await Product.findByIdAndUpdate(req.params.productId, { paymentConfirmedBySeller: true });

    // Finalize the order — generate QR + send email
    const io = req.app.get('io');
    const order = await finalizeOrder(req.params.productId, io);

    if (!order) return res.status(500).json({ success: false, message: 'Failed to finalize order' });

    res.json({ success: true, message: 'Payment confirmed! Order created.', orderId: order.orderId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/payment/:productId/end — seller manually ends auction early
const endAuctionEarly = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });

    const product = await Product.findOne({ _id: req.params.productId, shop: shop._id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.status !== 'active') return res.status(400).json({ success: false, message: 'Auction is not active' });

    // Set endsAt to now so cron picks it up, or process immediately
    await Product.findByIdAndUpdate(req.params.productId, { endsAt: new Date() });

    const io = req.app.get('io');

    // Import and run closeAuction immediately
    const { closeAuction } = require('../utils/auctionCron');
    const updatedProduct = await Product.findById(req.params.productId);
    await closeAuction(updatedProduct, io);

    if (io) {
      io.to(`product_${product._id}`).emit('auction_ended_early', { productId: product._id });
    }

    res.json({ success: true, message: 'Auction ended. Payment window started for highest bidder.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/payment/orders/:orderId/confirm-pickup-seller — seller confirms pickup
const confirmPickupBySeller = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    const order = await Order.findOne({ orderId: req.params.orderId, shop: shop._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.confirmedBySeller = true;
    if (order.confirmedByBuyer) {
      order.status = 'pickedup';
      order.paymentStatus = 'pickedup';
      order.pickedUpAt = new Date();
    }
    await order.save();

    const io = req.app.get('io');
    if (io) io.to(`product_${order.product}`).emit('pickup_confirmed', { orderId: order.orderId, by: 'seller', fullyConfirmed: order.confirmedByBuyer });

    res.json({ success: true, message: order.status === 'pickedup' ? 'Pickup fully confirmed!' : 'Seller confirmed. Waiting for buyer.', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/payment/orders/:orderId/confirm-pickup-buyer — buyer confirms pickup
const confirmPickupByBuyer = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId, buyer: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.confirmedByBuyer = true;
    if (order.confirmedBySeller) {
      order.status = 'pickedup';
      order.paymentStatus = 'pickedup';
      order.pickedUpAt = new Date();
    }
    await order.save();

    const io = req.app.get('io');
    if (io) io.to(`product_${order.product}`).emit('pickup_confirmed', { orderId: order.orderId, by: 'buyer', fullyConfirmed: order.confirmedBySeller });

    res.json({ success: true, message: order.status === 'pickedup' ? 'Pickup fully confirmed!' : 'Buyer confirmed. Waiting for seller.', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/payment/orders/search?orderId=SB-XXXX — seller search by order ID
const searchOrderById = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });

    const { orderId } = req.query;
    if (!orderId) return res.status(400).json({ success: false, message: 'orderId query required' });

    const order = await Order.findOne({ orderId: orderId.toUpperCase(), shop: shop._id })
      .populate({ path: 'product', select: 'title imageURL currentBid' })
      .populate({ path: 'buyer', select: 'name email' });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found in your shop' });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/payment/:productId/status — seller manually sets payment status
const manuallySetPaymentStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'paid' | 'not_paid' | 'pending'
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });

    const product = await Product.findOne({ _id: req.params.productId, shop: shop._id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found in your shop' });
    if (product.status !== 'payment_pending') return res.status(400).json({ success: false, message: 'Product is not in payment_pending status' });

    if (status === 'paid') {
      // Seller manually confirms payment — finalize order
      await Product.findByIdAndUpdate(product._id, { paymentConfirmedBySeller: true });
      const io = req.app.get('io');
      const order = await finalizeOrder(product._id, io);
      if (!order) return res.status(500).json({ success: false, message: 'Failed to finalize order' });
      return res.json({ success: true, message: 'Payment marked as received. Order created.', orderId: order.orderId });
    }

    if (status === 'not_paid') {
      // Seller manually rejects payment — ban this bidder and move to next
      const failedUserId = product.paymentWinner;
      await Bid.deleteMany({ product: product._id, bidder: failedUserId });
      const updated = await Product.findByIdAndUpdate(
        product._id,
        {
          $addToSet: { paymentAttempts: failedUserId },
          paymentWinner: null,
          paymentDeadline: null,
          txnCode: null,
          txnCodeEntered: null,
          paymentConfirmedByBuyer: false,
          paymentConfirmedBySeller: false,
        },
        { new: true }
      );
      const io = req.app.get('io');
      if (io) io.to(`product_${product._id}`).emit('payment_expired', {
        productId: product._id.toString(),
        failedUserId: failedUserId?.toString(),
        banned: true,
        message: 'Payment was rejected by seller.',
      });
      const { startPaymentWindow } = require('../utils/auctionCron');
      await startPaymentWindow(updated, io);
      return res.json({ success: true, message: 'Payment rejected. Moving to next bidder.' });
    }

    res.status(400).json({ success: false, message: 'Invalid status. Use "paid" or "not_paid".' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { markPaymentMade, confirmPaymentBySeller, endAuctionEarly, confirmPickupBySeller, confirmPickupByBuyer, searchOrderById, manuallySetPaymentStatus };
