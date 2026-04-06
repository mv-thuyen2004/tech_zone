require('dotenv').config(); 
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// 1. Cấu hình chìa khóa đăng nhập
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Cấu hình kho lưu trữ trên Cloud
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'TechZone_Products', // Tên thư mục nó sẽ tạo trên Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // Chỉ cho phép up ảnh
  },
});

// 3. Đóng gói lại thành middleware
const uploadCloud = multer({ storage });

module.exports = uploadCloud;