const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

// Route này bắt buộc phải đăng nhập và là admin mới được truy cập
router.get('/stats', protect, adminOnly, getDashboardStats);

module.exports = router;