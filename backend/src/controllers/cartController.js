const Cart = require('../models/Cart');

// 1. LẤY GIỎ HÀNG CỦA USER
const getCart = async (req, res) => {
  try {
    // req.user._id lấy từ hàm protect (middleware)
    let cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId', 'name price images slug');
    
    if (!cart) {
      // Nếu user chưa có giỏ hàng, tạo một cái rỗng trả về
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. THÊM HOẶC CẬP NHẬT SẢN PHẨM TRONG GIỎ HÀNG
const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    let cart = await Cart.findOne({ userId: req.user._id });

    // Nếu chưa có giỏ hàng, tạo mới
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    // Kiểm tra xem sản phẩm đã có trong giỏ chưa
    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex > -1) {
      // Nếu có rồi thì cộng dồn số lượng
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Nếu chưa có thì đẩy vào mảng
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    
    // Trả về giỏ hàng mới nhất (có hiển thị tên sản phẩm)
    const updatedCart = await Cart.findById(cart._id).populate('items.productId', 'name price images');
    res.json(updatedCart);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. XÓA SẢN PHẨM KHỎI GIỎ HÀNG
const removeFromCart = async (req, res) => {
  const { productId } = req.params;

  try {
    let cart = await Cart.findOne({ userId: req.user._id });

    if (cart) {
      // Lọc bỏ sản phẩm cần xóa ra khỏi mảng items
      cart.items = cart.items.filter(item => item.productId.toString() !== productId);
      await cart.save();
      
      const updatedCart = await Cart.findById(cart._id).populate('items.productId', 'name price images');
      res.json(updatedCart);
    } else {
      res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCart, addToCart, removeFromCart };