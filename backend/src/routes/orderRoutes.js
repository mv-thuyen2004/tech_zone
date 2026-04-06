const express = require('express');
const router = express.Router();
const { createOrder ,getMyOrders  } = require('../controllers/orderController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, createOrder); // Khóa bằng protect để lấy req.user
router.get('/myorders', protect, getMyOrders); // Lấy danh sách đơn hàng của người dùng đang đăng nhập

module.exports = router;