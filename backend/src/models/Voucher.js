const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Vui lòng nhập mã giảm giá'],
      unique: true,
      uppercase: true, // Ép chữ hoa, ví dụ: TET2024
    },
    discountType: {
      type: String,
      enum: ['percent', 'fixed'], // Giảm theo % hoặc giảm thẳng số tiền
      required: true,
    },
    discountValue: {
      type: Number,
      required: true, // Ví dụ: 20 (nếu là percent -> giảm 20%, nếu fixed -> giảm 20.000đ)
    },
    minOrderValue: {
      type: Number,
      default: 0, // Đơn tối thiểu để áp dụng
    },
    expiryDate: {
      type: Date,
      required: true, // Ngày hết hạn
    },
    usageLimit: {
      type: Number,
      default: 100, // Số lượt dùng tối đa
    },
    usedCount: {
      type: Number,
      default: 0, // Số lượt đã dùng
    },
    isActive: {
      type: Boolean,
      default: true, // Có thể tắt/bật mã thủ công
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Voucher', voucherSchema);