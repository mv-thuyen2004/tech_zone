const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true }, // Dùng để làm URL thân thiện (vd: op-lung-iphone-15)
  category: { type: String, required: true }, // vd: "Ốp lưng", "Củ sạc"
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  images: [{ type: String }],
  description: { type: String },
  
  // Dữ liệu vàng cho thuật toán Cross-selling và AI Chatbot
  compatibleModels: [{ type: String }], // vd: ["iPhone 15", "iPhone 15 Pro", "iPhone 15 Pro Max"]
  tags: [{ type: String }] // vd: ["Chống sốc", "Sạc nhanh 20W", "Magsafe"]
  
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);