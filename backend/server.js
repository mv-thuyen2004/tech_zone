const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const cartRoutes = require('./src/routes/cartRoutes'); 
const uploadRoutes = require('./src/routes/uploadRoutes'); // Route mới cho upload ảnh
const orderRoutes = require('./src/routes/orderRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

// Load biến môi trường từ file .env
dotenv.config();

// Kết nối Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Cho phép Express đọc dữ liệu JSON

// Route test thử server
app.get('/', (req, res) => {
  res.send('API Sàn TMĐT Phụ kiện đang chạy ngon lành!');
});

// Khai báo sử dụng routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/upload', uploadRoutes); // Route cho upload ảnh
app.use('/api/orders', orderRoutes); // Route cho quản lý đơn hàng
app.use('/api/admin', adminRoutes); // Route cho dashboard admin

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại cổng http://localhost:${PORT}`);
});