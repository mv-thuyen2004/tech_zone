const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true } // Giá tại thời điểm mua (đề phòng sau này SP tăng/giảm giá)
    }
  ],
  // Đây là nơi lưu số điện thoại và địa chỉ cho đơn hàng này
  shippingInfo: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  },
  totalPrice: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['COD', 'VNPAY'], default: 'COD' },
  status: { type: String, enum: ['Chờ xác nhận', 'Chờ thanh toán', 'Đang giao hàng', 'Đã giao thành công', 'Đã hủy'], default: 'Chờ xác nhận' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);