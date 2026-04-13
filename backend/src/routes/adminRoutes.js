const express = require('express');
const router = express.Router();
const {
	getDashboardStats,
	getAllOrders,
	updateOrderStatus,
	getAllUsers,
	updateUserRole,
	deleteUser,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

// Route này bắt buộc phải đăng nhập và là admin mới được truy cập
router.get('/stats', protect, adminOnly, getDashboardStats);
router.get('/orders', protect, adminOnly, getAllOrders);
router.put('/orders/:id/status', protect, adminOnly, updateOrderStatus);
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:id/role', protect, adminOnly, updateUserRole);
router.delete('/users/:id', protect, adminOnly, deleteUser);

module.exports = router;