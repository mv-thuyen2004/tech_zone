const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const Product = require('./src/models/Product');
const Order = require('./src/models/Order');

// Load biến môi trường
dotenv.config();

// Connect DB
connectDB();

const importData = async () => {
  try {
    // 1. Xóa sạch data cũ (nếu có) để tránh trùng lặp
    await Order.deleteMany(); // Nếu bạn đã tạo file Order.js
    await Product.deleteMany();
    await User.deleteMany();

    // 2. Tạo 1 tài khoản Admin mẫu
    const createdUsers = await User.insertMany([
      {
        fullName: 'Admin Hệ Thống',
        email: 'admin@gmail.com',
        password: 'password123', // Mật khẩu chưa hash (lát middleware save sẽ tự hash)
        role: 'admin',
        phone: '0988888888',
        address: 'Đại học Mỏ - Địa chất, Hà Nội'
      }
    ]);

    // 3. Tạo dữ liệu Sản phẩm mẫu (Data cực xịn cho thuật toán gợi ý)
    const sampleProducts = [
      {
        name: 'Ốp lưng Chống sốc iPhone 15 Pro Max',
        slug: 'op-lung-chong-soc-iphone-15-pro-max',
        category: 'Ốp lưng',
        price: 250000,
        stock: 50,
        description: 'Ốp lưng viền TPU chống sốc, mặt lưng PC trong suốt, hỗ trợ sạc Magsafe.',
        compatibleModels: ['iPhone 15 Pro Max'],
        tags: ['Chống sốc', 'Magsafe', 'Trong suốt']
      },
      {
        name: 'Kính cường lực Full màn iPhone 15 Pro Max',
        slug: 'kinh-cuong-luc-full-man-iphone-15-pro-max',
        category: 'Kính cường lực',
        price: 150000,
        stock: 100,
        description: 'Kính cường lực độ cứng 9H, chống vân tay, viền đen siêu mỏng.',
        compatibleModels: ['iPhone 15 Pro Max'],
        tags: ['Chống xước', '9H', 'Chống vân tay']
      },
      {
        name: 'Củ sạc nhanh 20W Type-C',
        slug: 'cu-sac-nhanh-20w-type-c',
        category: 'Sạc cáp',
        price: 350000,
        stock: 30,
        description: 'Củ sạc chuẩn PD 20W, sạc nhanh cho các dòng iPhone từ 12 đến 15.',
        compatibleModels: ['iPhone 12', 'iPhone 13', 'iPhone 14', 'iPhone 15', 'iPhone 15 Pro Max'],
        tags: ['Sạc nhanh', 'PD', '20W', 'Type-C']
      }
    ];

    await Product.insertMany(sampleProducts);

    console.log('✅ Đã nạp dữ liệu mẫu (Seed Data) thành công!');
    process.exit();
  } catch (error) {
    console.error(`❌ Lỗi khi nạp dữ liệu: ${error.message}`);
    process.exit(1);
  }
};

importData();