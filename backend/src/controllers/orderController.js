const Order = require('../models/Order');
const Product = require('../models/Product'); 

const createOrder = async (req, res) => {
  try {
    const { items, shippingInfo, totalPrice, paymentMethod } = req.body;

    if (items && items.length === 0) {
      return res.status(400).json({ message: 'Không có sản phẩm nào trong đơn hàng' });
    }

   
    // BƯỚC 1: CHỈ KIỂM TRA (VALIDATE) TẤT CẢ SẢN PHẨM
   
    const productsToUpdate = []; // Mảng tạm để lưu các sản phẩm đã pass kiểm tra
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({ message: `Sản phẩm không tồn tại!` });
      }
      
      if (product.stock < item.quantity) {
        // Ném lỗi ngay lập tức, và KHÔNG có dữ liệu nào bị lưu hay thay đổi cả
        return res.status(400).json({ 
          message: `Rất tiếc! Sản phẩm "${product.name}" chỉ còn ${product.stock} chiếc, không đủ số lượng bạn cần.` 
        });
      }
      
      // Nếu đủ hàng, cất tạm vào mảng chuẩn bị trừ kho
      productsToUpdate.push({ product, quantity: item.quantity });
    }

  
    // BƯỚC 2: TRỪ KHO ĐỒNG LOẠT
    // (Chỉ chạy đến đây khi vòng lặp trên đã pass 100%)
   
    for (const item of productsToUpdate) {
      item.product.stock -= item.quantity;
      await item.product.save(); // Lúc này mới thực sự lưu sự thay đổi vào Database
    }

    
    // BƯỚC 3: TẠO VÀ LƯU ĐƠN HÀNG
    
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

// LẤY DANH SÁCH ĐƠN HÀNG CỦA USER ĐANG ĐĂNG NHẬP
const getMyOrders = async (req, res) => {
  try {
    // Chỉ tìm những đơn hàng có userId khớp với ID của người đang request
    const orders = await Order.find({ userId: req.user._id })
      .populate('items.productId', 'name images')
      .sort({ createdAt: -1 }); // Mới nhất xếp lên đầu
      
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder , getMyOrders };