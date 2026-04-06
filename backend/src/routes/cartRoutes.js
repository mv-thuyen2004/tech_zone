const express = require('express');
const router = express.Router();
const { getCart, addToCart, removeFromCart ,clearCart} = require('../controllers/cartController');
const { protect } = require('../middlewares/authMiddleware');

// Khóa tất cả các route này bằng hàm 'protect'
router.route('/').get(protect, getCart).post(protect, addToCart);
router.route('/clear').delete(protect, clearCart);
router.route('/:productId').delete(protect, removeFromCart);


module.exports = router;