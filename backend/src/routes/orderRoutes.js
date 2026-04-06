const express = require('express');
const router = express.Router();
const { createOrder ,getMyOrders ,createPaymentUrl, vnpayReturn } = require('../controllers/orderController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, createOrder); // Khóa bằng protect để lấy req.user
router.get('/myorders', protect, getMyOrders); // Lấy danh sách đơn hàng của người dùng đang đăng nhập
router.post('/vnpay-return', protect, vnpayReturn); // Route hứng kết quả
router.post('/:id/create_payment_url', protect, createPaymentUrl); // Route tạo link
module.exports = router;