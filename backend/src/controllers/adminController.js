const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

// HÀM 1: LẤY THỐNG KÊ DASHBOARD
const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    
    // --- SỬA Ở ĐÂY: Chỉ đếm các đơn khác trạng thái 'Đã hủy' ---
    const totalOrders = await Order.countDocuments({ status: { $ne: 'Đã hủy' } });
    
    // --- SỬA Ở ĐÂY: Chỉ tính tiền các đơn hợp lệ ---
    const validOrders = await Order.find({ status: { $ne: 'Đã hủy' } });
    const totalRevenue = validOrders.reduce((sum, order) => sum + order.totalPrice, 0);

    // Dữ liệu biểu đồ (Giữ nguyên)
    const productsByCategory = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    const chartData = productsByCategory.map(item => ({
      name: item._id,
      total: item.count
    }));

    // Dữ liệu bảng 5 đơn mới nhất (Vẫn hiện cả đơn hủy để Admin biết)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'fullName email');

    res.json({ totalProducts, totalUsers, totalOrders, totalRevenue, chartData, recentOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 1. LẤY TẤT CẢ ĐƠN HÀNG (Dành cho Admin)
const getAllOrders = async (req, res) => {
  try {
    // Populate để lấy thêm thông tin Tên và Email của người mua từ bảng User
    const orders = await Order.find({})
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 }); // Mới nhất xếp lên đầu
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // --- LOGIC MỚI: Nếu Admin bấm chuyển sang "Đã hủy" ---
    if (req.body.status === 'Đã hủy' && order.status !== 'Đã hủy') {
      // Import model Product ở đầu file nếu chưa có: const Product = require('../models/Product');
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.stock += item.quantity; // Trả lại số lượng vào kho
          await product.save();
        }
      }
    }

    order.status = req.body.status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. LẤY DANH SÁCH TÀI KHOẢN (Dành cho Admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. CẬP NHẬT QUYỀN TÀI KHOẢN
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Vai trò không hợp lệ' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    }

    user.role = role;
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. XÓA TÀI KHOẢN
const deleteUser = async (req, res) => {
  try {
    if (req.user && req.user._id && req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'Không thể tự xóa tài khoản admin đang đăng nhập' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa tài khoản thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  updateUserRole,
  deleteUser,
};