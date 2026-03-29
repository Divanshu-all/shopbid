const Shop = require('../models/Shop');

// @POST /api/shops — create shop
const createShop = async (req, res) => {
  try {
    const existing = await Shop.findOne({ owner: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already have a shop' });
    }
    const { shopName, description, address, lat, lng, category, upiId } = req.body;
    const photo = req.file ? req.file.path : '';

    const shop = await Shop.create({
      owner: req.user._id,
      shopName,
      description,
      address,
      location: { lat: parseFloat(lat), lng: parseFloat(lng) },
      photo,
      category,
      upiId: upiId || '',
    });

    res.status(201).json({ success: true, shop });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/shops/my — get own shop
const getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) return res.status(404).json({ success: false, message: 'No shop found. Please create one.' });
    res.json({ success: true, shop });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/shops — all active shops
const getAllShops = async (req, res) => {
  try {
    const shops = await Shop.find({ isActive: true }).populate('owner', 'name');
    res.json({ success: true, shops });
  } catch (err) {
    console.error('getAllShops error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/shops/:id
const getShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('owner', 'name email');
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });
    res.json({ success: true, shop });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/shops/:id — update shop
const updateShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ _id: req.params.id, owner: req.user._id });
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });

    const { shopName, description, address, lat, lng, category, upiId } = req.body;
    if (shopName) shop.shopName = shopName;
    if (description) shop.description = description;
    if (address) shop.address = address;
    if (lat && lng) shop.location = { lat: parseFloat(lat), lng: parseFloat(lng) };
    if (category) shop.category = category;
    if (upiId !== undefined) shop.upiId = upiId;
    if (req.file) shop.photo = req.file.path;

    await shop.save();
    res.json({ success: true, shop });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createShop, getMyShop, getAllShops, getShop, updateShop };
