const Product = require('../models/Product');

// LẤY DANH SÁCH SẢN PHẨM (Nâng cấp Search thông minh + Phân trang + Lọc)
const getProducts = async (req, res) => {
  try {
    // 1. Cấu hình phân trang
    const pageSize = 10;
    const page = Number(req.query.page) || 1;

    // 2. Logic tìm kiếm NÂNG CAO (Multi-word & Multi-field)
    let keywordQuery = {};
    if (req.query.keyword) {
      // Tách chuỗi người dùng nhập thành các từ riêng lẻ (loại bỏ khoảng trắng thừa)
      // Ví dụ: "sạc iphone" -> ["sạc", "iphone"]
      const searchWords = req.query.keyword.trim().split(/\s+/);

      // Tạo mảng điều kiện: Sản phẩm phải chứa TẤT CẢ các từ khóa ($and)
      const andConditions = searchWords.map((word) => ({
        // Mỗi từ khóa có thể nằm ở 1 trong 4 trường này ($or)
        $or: [
          { name: { $regex: word, $options: 'i' } },              // Tìm trong tên
          { category: { $regex: word, $options: 'i' } },          // Tìm trong danh mục
          { compatibleModels: { $regex: word, $options: 'i' } },  // Tìm trong mảng thiết bị hỗ trợ
          { tags: { $regex: word, $options: 'i' } }               // Tìm trong tags
        ]
      }));

      keywordQuery = { $and: andConditions };
    }

    // 3. Lọc theo danh mục (nếu người dùng bấm các nút Category trên giao diện)
    const categoryFilter = req.query.category ? { category: req.query.category } : {};
    
    // Gộp chung bộ lọc tìm kiếm và bộ lọc danh mục
    const query = { ...keywordQuery, ...categoryFilter };

    // 4. Đếm tổng số sản phẩm thỏa mãn điều kiện
    const count = await Product.countDocuments(query);

    // 5. Lấy dữ liệu theo trang
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    // 6. Trả về kết quả
    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      totalProducts: count
    });
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

// LẤY DANH SÁCH SẢN PHẨM GỢI Ý (Cross-selling)
const getRecommendedProducts = async (req, res) => {
  try {
    // 1. Lấy thông tin sản phẩm hiện tại
    const currentProduct = await Product.findById(req.params.productId);
    
    if (!currentProduct) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    // 2. Thuật toán tìm kiếm
    const recommendations = await Product.find({
      _id: { $ne: currentProduct._id }, // Loại trừ chính nó
      category: { $ne: currentProduct.category }, // Khác danh mục (Cross-sell)
      compatibleModels: { $in: currentProduct.compatibleModels } // Có chung ít nhất 1 dòng máy hỗ trợ
    }).limit(4); // Lấy tối đa 4 sản phẩm gợi ý

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = { getProducts, getProductBySlug, createProduct , deleteProduct, updateProduct, getRecommendedProducts};