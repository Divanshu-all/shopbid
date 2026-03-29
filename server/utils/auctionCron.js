const cron = require('node-cron');
const Product = require('../models/Product');
const Bid = require('../models/Bid');
const Order = require('../models/Order');
const User = require('../models/User');
const Shop = require('../models/Shop');
const { generateQR } = require('./qrGenerator');
const { sendWinnerEmail, sendPaymentRequestEmail } = require('./mailer');
const crypto = require('crypto');

const PAYMENT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

const startPaymentWindow = async (product, io) => {
  try {
    const failedIds = product.paymentAttempts || [];
    const highestBid = await Bid.findOne({
      product: product._id,
      bidder: { $nin: failedIds },
    }).sort({ amount: -1 }).populate('bidder', 'name email');

    if (!highestBid) {
      // No eligible bidders left — reopen auction for 30 more minutes instead of voiding
      const reopenEndsAt = new Date(Date.now() + 30 * 60 * 1000);
      await Product.findByIdAndUpdate(product._id, {
        status: 'active',
        paymentWinner: null,
        paymentDeadline: null,
        txnCode: null,
        txnCodeEntered: null,
        endsAt: reopenEndsAt,
      });
      console.log(`🔄 No eligible bidders — auction reopened for 30 minutes: ${product.title}`);
      if (io) io.to(`product_${product._id}`).emit('auction_reopened', {
        productId: product._id.toString(),
        endsAt: reopenEndsAt,
        message: 'All payment windows expired. Auction has been reopened for new bids!',
      });
      return;
    }

    const deadline = new Date(Date.now() + PAYMENT_WINDOW_MS);

    // Generate unique transaction code for this payment window
    const txnCode = 'TXN-' + crypto.randomBytes(3).toString('hex').toUpperCase();

    await Product.findByIdAndUpdate(product._id, {
      status: 'payment_pending',
      paymentWinner: highestBid.bidder._id,
      paymentDeadline: deadline,
      currentWinner: highestBid.bidder._id,
      currentBid: highestBid.amount,
      txnCode,
      txnCodeEntered: null, // reset from any previous attempt
    });

    console.log(`Payment window started for ${highestBid.bidder.name} on "${product.title}"`);

    if (io) {
      io.to(`product_${product._id}`).emit('payment_required', {
        productId: product._id.toString(),
        winnerId: highestBid.bidder._id.toString(),
        winnerName: highestBid.bidder.name,
        amount: highestBid.amount,
        deadline,
        txnCode,
      });
    }

    const shop = await Shop.findById(product.shop);
    try {
      await sendPaymentRequestEmail({
        to: highestBid.bidder.email,
        buyerName: highestBid.bidder.name,
        productTitle: product.title,
        amount: highestBid.amount,
        productId: product._id,
        deadline,
        upiId: shop?.upiId || '',
        shopName: shop?.shopName || '',
        txnCode,
      });
    } catch (e) { console.error('Payment email failed:', e.message); }
  } catch (err) {
    console.error('startPaymentWindow error:', err.message);
  }
};

const closeAuction = async (product, io) => {
  try {
    const hasBids = await Bid.findOne({ product: product._id });
    if (!hasBids) {
      await Product.findByIdAndUpdate(product._id, { status: 'void' });
      if (io) io.to(`product_${product._id}`).emit('auction_closed', { productId: product._id, status: 'void' });
      return;
    }
    await startPaymentWindow(product, io);
  } catch (err) {
    console.error('closeAuction error:', err.message);
  }
};

const finalizeOrder = async (productId, io) => {
  try {
    const product = await Product.findById(productId).populate('paymentWinner', 'name email');
    if (!product || !product.paymentWinner) return null;

    const shop = await Shop.findById(product.shop);
    const orderId = 'SB-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    const qrCode = await generateQR(orderId);

    const order = await Order.create({
      product: product._id,
      buyer: product.paymentWinner._id,
      shop: product.shop,
      finalAmount: product.currentBid,
      qrCode,
      orderId,
      paymentStatus: 'paid',
    });

    await Product.findByIdAndUpdate(product._id, { status: 'sold' });

    try {
      await sendWinnerEmail({
        to: product.paymentWinner.email,
        buyerName: product.paymentWinner.name,
        productTitle: product.title,
        orderId,
        qrCode,
        shopName: shop?.shopName || 'Shop',
        shopAddress: shop?.address || '',
        amount: product.currentBid,
      });
    } catch (e) { console.error('Winner email failed:', e.message); }

    if (io) {
      io.to(`product_${product._id}`).emit('order_created', {
        productId: product._id,
        orderId,
        buyerId: product.paymentWinner._id.toString(),
      });
    }

    console.log(`Order finalized: ${orderId}`);
    return order;
  } catch (err) {
    console.error('finalizeOrder error:', err.message);
    return null;
  }
};

const startAuctionCron = (io) => {
  cron.schedule('* * * * *', async () => {
    try {
      const expiredProducts = await Product.find({ status: 'active', endsAt: { $lte: new Date() } });
      for (const product of expiredProducts) await closeAuction(product, io);

      const expiredPayments = await Product.find({ status: 'payment_pending', paymentDeadline: { $lte: new Date() } });
      for (const product of expiredPayments) {
        console.log(`Payment window expired: ${product.title}`);

        const failedUserId = product.paymentWinner;

        // Delete all bids by this user on this product — they are disqualified
        await Bid.deleteMany({ product: product._id, bidder: failedUserId });
        console.log(`🗑️  Deleted bids by ${failedUserId} on "${product.title}"`);

        // Add to permanent blacklist for this product
        const updated = await Product.findByIdAndUpdate(
          product._id,
          {
            $addToSet: { paymentAttempts: failedUserId },
            paymentWinner: null,
            paymentDeadline: null,
          },
          { new: true }
        );

        if (io) io.to(`product_${product._id}`).emit('payment_expired', {
          productId: product._id.toString(),
          failedUserId: failedUserId?.toString(),
          banned: true,
          message: 'Your bids have been removed. You are no longer eligible to bid on this product.',
        });

        // Try next highest bidder
        await startPaymentWindow(updated, io);
      }
    } catch (err) { console.error('Cron error:', err.message); }
  });
  console.log('⏰ Auction cron job started');
};

module.exports = { startAuctionCron, closeAuction, startPaymentWindow, finalizeOrder };
