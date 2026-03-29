const express = require('express');
const router = express.Router();
const {
  markPaymentMade,
  confirmPaymentBySeller,
  endAuctionEarly,
  confirmPickupBySeller,
  confirmPickupByBuyer,
  searchOrderById,
  manuallySetPaymentStatus,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

// Order ID search — seller
router.get('/orders/search', protect, authorize('shopkeeper'), searchOrderById);

// Pickup confirmation
router.post('/orders/:orderId/confirm-pickup-seller', protect, authorize('shopkeeper'), confirmPickupBySeller);
router.post('/orders/:orderId/confirm-pickup-buyer',  protect, authorize('buyer'),      confirmPickupByBuyer);

// Payment flow
router.post('/:productId/pay',     protect, authorize('buyer'),       markPaymentMade);
router.post('/:productId/confirm', protect, authorize('shopkeeper'),  confirmPaymentBySeller);
router.post('/:productId/end',     protect, authorize('shopkeeper'),  endAuctionEarly);
router.put('/:productId/status',   protect, authorize('shopkeeper'),  manuallySetPaymentStatus);

module.exports = router;
