const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Giải mã token (Cần biến môi trường JWT_SECRET)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Tìm User trong DB và gán vào request (bỏ qua field password)
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Không được ủy quyền, token hỏng' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Không được ủy quyền, không có token' });
  }
};
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: "Bạn không có quyền Admin!" });
  }
};
module.exports = { protect , adminOnly };