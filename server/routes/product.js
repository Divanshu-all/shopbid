const express = require('express');
const router = express.Router();
const { createProduct, getProducts, getMyProducts, getProduct, getProductsByShop } = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const { upload } = require('../config/cloudinary');

router.get('/my', protect, authorize('shopkeeper'), getMyProducts);  // must be before /:id
router.get('/shop/:shopId', getProductsByShop);
router.get('/', getProducts);
router.post('/', protect, authorize('shopkeeper'), upload.single('image'), createProduct);
router.get('/:id', getProduct);

module.exports = router;
