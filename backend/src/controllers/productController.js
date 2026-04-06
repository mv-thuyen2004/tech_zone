const Product = require('../models/Product');

// LẤY DANH SÁCH SẢN PHẨM (Có search và filter)
const getProducts = async (req, res) => {
  try {
    // Nếu người dùng search tên sản phẩm
    const keyword = req.query.keyword
      ? { name: { $regex: req.query.keyword, $options: 'i' } }
      : {};

    // Nếu người dùng filter theo category (vd: ?category=Ốp lưng)
    const categoryFilter = req.query.category ? { category: req.query.category } : {};

    const products = await Product.find({ ...keyword, ...categoryFilter }).sort({ createdAt: -1 }); // Sắp xếp mới nhất lên đầu
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LẤY CHI TIẾT 1 SẢN PHẨM (Bằng slug)
const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const createProduct = async (req, res) => {
  try {
    const { name, slug, price, description, category, images, stock, tags } = req.body;

    const product = new Product({
      name,
      slug,
      price,
      description,
      category,
      images,
      stock ,
      tags
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Hàm xóa sản phẩm
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Đã xóa sản phẩm thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server khi xóa" });
  }
};

// Hàm cập nhật sản phẩm
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Cập nhật các trường (nếu người dùng có gửi lên thì lấy mới, không thì giữ nguyên cũ)
      product.name = req.body.name || product.name;
      product.price = req.body.price || product.price;
      product.category = req.body.category || product.category;
      product.description = req.body.description || product.description;
      product.compatibleModels = req.body.compatibleModels || product.compatibleModels;
      product.tags = req.body.tags || product.tags;
      product.slug = req.body.slug || product.slug;

      // Chỉ cập nhật ảnh nếu người dùng có upload ảnh mới
      if (req.body.images && req.body.images.length > 0) {
        product.images = req.body.images;
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server khi cập nhật" });
  }
};


module.exports = { getProducts, getProductBySlug, createProduct , deleteProduct, updateProduct};