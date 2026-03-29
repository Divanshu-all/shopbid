const express = require('express');
const router = express.Router();
const { getMyOrders, getShopOrders, verifyOrder, markPickedup, getAnalytics } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.get('/my',               protect, authorize('buyer'),       getMyOrders);
router.get('/shop',             protect, authorize('shopkeeper'),  getShopOrders);
router.get('/analytics',        protect, authorize('shopkeeper'),  getAnalytics);
router.get('/verify/:orderId',  protect, authorize('shopkeeper'),  verifyOrder);
router.put('/pickup/:orderId',  protect, authorize('shopkeeper'),  markPickedup);

module.exports = router;
