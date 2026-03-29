const express = require('express');
const router = express.Router();
const { createShop, getMyShop, getAllShops, getShop, updateShop } = require('../controllers/shopController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const { upload } = require('../config/cloudinary');

router.get('/my', protect, authorize('shopkeeper'), getMyShop);  // must be before /:id
router.get('/', getAllShops);
router.post('/', protect, authorize('shopkeeper'), upload.single('photo'), createShop);
router.get('/:id', getShop);
router.put('/:id', protect, authorize('shopkeeper'), upload.single('photo'), updateShop);

module.exports = router;
