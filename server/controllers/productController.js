const Product = require('../models/Product');
const Shop = require('../models/Shop');

// @POST /api/products — create listing
const createProduct = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) return res.status(404).json({ success: false, message: 'Create a shop first' });

    const { title, description, startPrice, buyNowPrice, duration, category } = req.body;

    if (!req.file) return res.status(400).json({ success: false, message: 'Product image is required' });

    const durationHours = parseInt(duration) || 24;
    const endsAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);

    const product = await Product.create({
      shop: shop._id,
      title,
      description,
      imageURL: req.file.path,
      imagePublicId: req.file.filename,
      startPrice: parseFloat(startPrice),
      buyNowPrice: buyNowPrice ? parseFloat(buyNowPrice) : null,
      currentBid: parseFloat(startPrice),
      duration: durationHours,
      endsAt,
      category: category || 'other',
    });

    // Notify all clients about new listing
    const io = req.app.get('io');
    if (io) io.emit('new_listing', { product });

    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/products — all active products (with filters)
const getProducts = async (req, res) => {
  try {
    const { category, sort, search } = req.query;
    const filter = { status: 'active', endsAt: { $gt: new Date() } };
    if (category && category !== 'all') filter.category = category;
    if (search) filter.title = { $regex: search, $options: 'i' };

    let sortObj = { endsAt: 1 }; // default: ending soon
    if (sort === 'newest') sortObj = { createdAt: -1 };
    if (sort === 'price_low') sortObj = { currentBid: 1 };
    if (sort === 'price_high') sortObj = { currentBid: -1 };

    const products = await Product.find(filter)
      .sort(sortObj)
      .populate({ path: 'shop', select: 'shopName address location photo category' })
      .populate({ path: 'currentWinner', select: 'name' });

    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/products/my — shopkeeper's own products
const getMyProducts = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });

    const products = await Product.find({ shop: shop._id })
      .sort({ createdAt: -1 })
      .populate('currentWinner', 'name email')
      .select('+txnCode +txnCodeEntered');

    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/products/:id
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate({ path: 'shop', select: 'shopName address location photo owner', populate: { path: 'owner', select: 'name' } })
      .populate('currentWinner', 'name');

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Increment view count
    await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/products/shop/:shopId — products by shop
const getProductsByShop = async (req, res) => {
  try {
    const products = await Product.find({ shop: req.params.shopId, status: 'active' })
      .sort({ endsAt: 1 });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createProduct, getProducts, getMyProducts, getProduct, getProductsByShop };
