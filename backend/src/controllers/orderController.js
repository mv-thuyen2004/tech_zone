const Order = require('../models/Order');

const createOrder = async (req, res) => {
  try {
    const { items, shippingInfo, totalPrice, paymentMethod } = req.body;

    if (items && items.length === 0) {
      return res.status(400).json({ message: 'Không có sản phẩm nào trong đơn hàng' });
    }

    const order = new Order({
      userId: req.user._id,
      items,
      shippingInfo,
      totalPrice,
      paymentMethod: paymentMethod || 'COD'
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder };