const Order = require('../models/Order');
const Shop = require('../models/Shop');
const Product = require('../models/Product');

// @GET /api/orders/my — buyer's won orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .sort({ createdAt: -1 })
      .populate({ path: 'product', select: 'title imageURL currentBid' })
      .populate({ path: 'shop', select: 'shopName address location photo' });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/orders/shop — shopkeeper's incoming orders
const getShopOrders = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });

    const orders = await Order.find({ shop: shop._id })
      .sort({ createdAt: -1 })
      .populate({ path: 'product', select: 'title imageURL currentBid' })
      .populate({ path: 'buyer', select: 'name email' });

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/orders/verify/:orderId — validate QR before marking pickup
const verifyOrder = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });

    const order = await Order.findOne({ orderId: req.params.orderId, shop: shop._id })
      .populate({ path: 'product', select: 'title imageURL' })
      .populate({ path: 'buyer', select: 'name email' });

    if (!order) return res.status(404).json({ success: false, message: 'Invalid QR — order not found for your shop' });
    if (order.status === 'pickedup') return res.status(400).json({ success: false, message: 'This order has already been picked up' });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/orders/pickup/:orderId — mark as picked up
const markPickedup = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });

    const order = await Order.findOne({ orderId: req.params.orderId, shop: shop._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.status === 'pickedup') return res.status(400).json({ success: false, message: 'Already picked up' });

    order.status = 'pickedup';
    order.pickedUpAt = new Date();
    await order.save();

    res.json({ success: true, message: 'Order marked as picked up ✅', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/orders/analytics — shopkeeper analytics
const getAnalytics = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });

    const [products, orders] = await Promise.all([
      Product.find({ shop: shop._id }),
      Order.find({ shop: shop._id }).populate('product', 'title'),
    ]);

    const totalRevenue = orders.filter(o => o.status === 'pickedup').reduce((sum, o) => sum + o.finalAmount, 0);
    const activeListings = products.filter(p => p.status === 'active').length;
    const soldListings = products.filter(p => p.status === 'sold').length;
    const voidListings = products.filter(p => p.status === 'void').length;
    const pendingPickups = orders.filter(o => o.status === 'pending').length;

    res.json({
      success: true,
      analytics: {
        totalRevenue,
        activeListings,
        soldListings,
        voidListings,
        pendingPickups,
        totalOrders: orders.length,
        totalViews: products.reduce((sum, p) => sum + p.views, 0),
        recentOrders: orders.slice(-5).reverse(),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMyOrders, getShopOrders, verifyOrder, markPickedup, getAnalytics };
