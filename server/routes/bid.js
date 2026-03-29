const express = require('express');
const router = express.Router();
const { placeBid, getProductBids, getMyBids } = require('../controllers/bidController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.get('/my', protect, authorize('buyer'), getMyBids);
router.get('/:productId', getProductBids);
router.post('/:productId', protect, authorize('buyer'), placeBid);

module.exports = router;
