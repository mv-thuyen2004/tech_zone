const express = require('express');
const router = express.Router();
const uploadCloud = require('../middlewares/uploadMiddleware'); // Đường dẫn trỏ tới file vừa tạo ở Bước 3

// API: POST /api/upload
// 'image' chính là cái tên biến mà Frontend sẽ gửi lên
router.post('/', uploadCloud.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Không có file nào được tải lên!' });
  }

  // THÀNH CÔNG! Trả về cái URL của ảnh trên Cloudinary
  res.status(200).json({
    message: 'Tải ảnh lên thành công!',
    imageUrl: req.file.path // <-- ĐÂY LÀ CÁI ĐƯỜNG DẪN BẠN CẦN LƯU VÀO DATABASE
  });
});

module.exports = router;