const express = require('express');
const router = express.Router();
const { getAllVouchers, createVoucher, deleteVoucher, applyVoucher } = require('../controllers/voucherController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');




router.post('/apply', protect, applyVoucher); // User dùng
router.get('/', protect, adminOnly, getAllVouchers); // Admin dùng
router.post('/', protect, adminOnly, createVoucher); // Admin dùng
router.delete('/:id', protect, adminOnly, deleteVoucher); // Admin dùng

module.exports = router;