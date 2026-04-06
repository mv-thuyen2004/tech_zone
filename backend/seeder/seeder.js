const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const cloudinary = require('cloudinary').v2;

// Import config và Models
const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');

// Load biến môi trường
dotenv.config();

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Kết nối DB
connectDB();

// Hàm hỗ trợ upload 1 ảnh lên Cloudinary
const uploadImageToCloudinary = async (imageFileName) => {
  if (!imageFileName || imageFileName.trim() === "") return null;

  // Đường dẫn trỏ tới thư mục images
  const imagePath = path.join(__dirname, 'images', imageFileName.trim());

  if (!fs.existsSync(imagePath)) {
    console.warn(`⚠️ Cảnh báo: Không tìm thấy file ảnh ${imagePath}`);
    return null;
  }

  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: 'TechZone_Products', 
    });
    return result.secure_url; 
  } catch (error) {
    console.error(`❌ Lỗi upload ảnh ${imageFileName}:`, error);
    return null;
  }
};

const importData = async () => {
  try {
    // 1. Xóa sạch data cũ
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    // 2. Tạo 1 tài khoản Admin mẫu
    await User.create([
      {
        fullName: 'Admin Hệ Thống',
        email: 'admin@gmail.com',
        password: 'password123',
        role: 'admin',
        phone: '0988888888',
        address: 'Đại học Mỏ - Địa chất, Hà Nội'
      }
    ]);
    console.log('✅ Đã tạo tài khoản Admin.');

    // 3. Đọc file CSV và Import
    const results = [];
    const csvFilePath = path.join(__dirname, 'data.csv');

    console.log('⏳ Đang đọc file CSV và Upload ảnh lên Cloudinary. Vui lòng đợi...');

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        
        for (const row of results) {
          // BƯỚC QUAN TRỌNG: Lấy tên file ảnh từ cột image_file
          const imageUrl = await uploadImageToCloudinary(row.image_file);

          // Tạo object sản phẩm chuẩn bị lưu vào DB
          const productData = {
            name: row.name,
            // Tự động tạo slug từ tên (vd: "Ốp lưng" -> "op-lung")
            slug: row.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, ''),
            category: row.category,
            price: Number(row.price || 0),
            stock: Number(row.stock || 0),
            description: row.description,
            // Lưu URL ảnh lấy từ Cloudinary
            images: imageUrl ? [imageUrl] : [], 
            // Cắt chuỗi thành mảng
            compatibleModels: row.compatibleModels ? row.compatibleModels.split(',').map(i => i.trim()) : [],
            tags: row.tags ? row.tags.split(',').map(i => i.trim()) : []
          };

          await Product.create(productData);
          console.log(`📦 Đã import thành công: ${row.name}`);
        }

        console.log('✅ HOÀN TẤT IMPORT DỮ LIỆU TỪ CSV!');
        process.exit();
      });

  } catch (error) {
    console.error(`❌ Lỗi khi nạp dữ liệu: ${error.message}`);
    process.exit(1);
  }
};

importData();