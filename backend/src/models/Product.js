const mongoose = require('mongoose');

// 1. TẠO SCHEMA CHO TỪNG ĐÁNH GIÁ (Nằm trên Product Schema)
const reviewSchema = mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
}, { timestamps: true });

// 2. NHÚNG REVIEW VÀO PRODUCT SCHEMA
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  description: { type: String },
  category: { type: String, required: true },
  images: [{ type: String }],
  compatibleModels: [{ type: String }],
  stock: { type: Number, default: 0 },
  
  // THÊM 3 TRƯỜNG NÀY ĐỂ QUẢN LÝ ĐÁNH GIÁ:
  reviews: [reviewSchema], // Mảng chứa các bình luận
  rating: { type: Number, required: true, default: 0 }, // Điểm sao trung bình
  numReviews: { type: Number, required: true, default: 0 }, // Tổng số người đã đánh giá
  
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);