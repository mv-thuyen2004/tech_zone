const Voucher = require('../models/Voucher');

const applyVoucher = async (req, res) => {
  try {
    const { code, cartTotal } = req.body; // Lấy mã và tổng tiền giỏ hàng từ Frontend

    // 1. Tìm voucher trong DB
    const voucher = await Voucher.findOne({ code: code.toUpperCase() });

    // 2. Các bước xác thực (Validation)
    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Mã giảm giá không tồn tại!' });
    }
    if (!voucher.isActive) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá đã bị khóa!' });
    }
    if (new Date() > voucher.expiryDate) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá đã hết hạn!' });
    }
    if (voucher.usedCount >= voucher.usageLimit) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá đã hết lượt sử dụng!' });
    }
    if (cartTotal < voucher.minOrderValue) {
      return res.status(400).json({ 
        success: false, 
        message: `Đơn hàng phải từ ${voucher.minOrderValue.toLocaleString()}đ để áp dụng mã này!` 
      });
    }

    // 3. Tính toán số tiền được giảm
    let discountAmount = 0;
    if (voucher.discountType === 'percent') {
      discountAmount = (cartTotal * voucher.discountValue) / 100;
      // Tùy chọn: Bạn có thể thêm trường maxDiscount (Giảm tối đa bao nhiêu) để giới hạn
    } else if (voucher.discountType === 'fixed') {
      discountAmount = voucher.discountValue;
    }

    // Đảm bảo tiền giảm không lớn hơn tổng tiền
    discountAmount = Math.min(discountAmount, cartTotal);

    res.status(200).json({
      success: true,
      message: 'Áp dụng mã thành công!',
      data: {
        voucherCode: voucher.code,
        discountAmount: discountAmount,
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// [GET] Lấy tất cả mã giảm giá
const getAllVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, vouchers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [POST] Tạo mã mới
const createVoucher = async (req, res) => {
  try {
    const newVoucher = await Voucher.create(req.body);
    res.status(201).json({ success: true, message: 'Tạo mã thành công!', voucher: newVoucher });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Mã này đã tồn tại!' });
    res.status(500).json({ success: false, message: error.message });
  }
};

// [DELETE] Xóa mã
const deleteVoucher = async (req, res) => {
  try {
    await Voucher.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Đã xóa mã giảm giá!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = { applyVoucher, getAllVouchers, createVoucher, deleteVoucher };