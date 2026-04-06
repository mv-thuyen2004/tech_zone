const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Hàm tạo Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// ĐĂNG KÝ
const registerUser = async (req, res) => {
  try {
    const { fullName, email, password , phone, address } = req.body;

    // 1. Kiểm tra xem email đã tồn tại chưa
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email này đã được sử dụng!' });
    }

    // 2. BĂM MẬT KHẨU TRƯỚC KHI TẠO USER (Đây là phần còn thiếu lúc nãy)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Tạo tài khoản mới với mật khẩu ĐÃ MÃ HÓA
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phone: req.body.phone,
      address: req.body.address
    });

    if (user) {
      return res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' })
      });
    } else {
      return res.status(400).json({ message: 'Dữ liệu người dùng không hợp lệ' });
    }
  } catch (error) {
    console.error("Lỗi Đăng ký:", error);
    return res.status(500).json({ message: "Lỗi máy chủ: " + error.message });
  }
};

// ĐĂNG NHẬP
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    // Kiểm tra email và password (hàm matchPassword đã viết ở Model)
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,    
        address: user.address, 
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // 1. CẬP NHẬT THÔNG TIN CƠ BẢN
    user.fullName = req.body.fullName || user.fullName;
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.address !== undefined) user.address = req.body.address;

    // 2. CẬP NHẬT MẬT KHẨU
    if (req.body.newPassword && req.body.currentPassword) {
      const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Mật khẩu hiện tại không chính xác!' });
      }

      // TỰ TAY BĂM MẬT KHẨU TẠI ĐÂY (Giải quyết triệt để lỗi Mongoose)
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.newPassword, salt);
    }

    const updatedUser = await user.save();

    return res.json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      role: updatedUser.role,
    });
    
  } catch (error) {
    console.error("Lỗi Update Profile:", error);
    return res.status(500).json({ message: "Lỗi máy chủ: " + error.message });
  }
};

module.exports = { registerUser, loginUser, updateUserProfile };