const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

const getDashboardStats = async (req, res) => {
  try {
    // Đếm tổng số sản phẩm
    const totalProducts = await Product.countDocuments();
    
    // Đếm tổng số khách hàng (những người có role là 'user')
    const totalUsers = await User.countDocuments({ role: 'user' });
    
    // Đếm tổng số đơn hàng
    const totalOrders = await Order.countDocuments();
    
    // Tính tổng doanh thu (Cộng dồn tất cả các đơn)
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    res.json({
      totalProducts,
      totalUsers,
      totalOrders,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };