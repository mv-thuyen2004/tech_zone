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
      // 1. Định nghĩa các từ không có giá trị tìm kiếm (Stop-words tiếng Việt)
      const stopWords = ['cho', 'và', 'của', 'với', 'các', 'những', 'thì', 'là', 'mà'];
      // Ví dụ: "sạc iphone" -> ["sạc", "iphone"]
      const searchWords = req.query.keyword
        .trim()
        .split(/\s+/)
        .filter(word => !stopWords.includes(word.toLowerCase())); // Loại bỏ stop-words

      // Tạo mảng điều kiện: Sản phẩm phải chứa TẤT CẢ các từ khóa ($and)
      if (searchWords.length > 0) {
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
    }
    // 3. Lọc theo danh mục (nếu người dùng bấm các nút Category trên giao diện)
    const categoryFilter = req.query.category ? { category: req.query.category } : {};

    // --- 1. LỌC THEO MỨC GIÁ ---
    let priceFilter = {};
    if (req.query.minPrice || req.query.maxPrice) {
      priceFilter.price = {};
      if (req.query.minPrice) priceFilter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) priceFilter.price.$lte = Number(req.query.maxPrice);
    }
    
    // Gộp chung bộ lọc tìm kiếm và bộ lọc danh mục
    const query = { ...keywordQuery, ...categoryFilter, ...priceFilter };

    // 4. Đếm tổng số sản phẩm thỏa mãn điều kiện
    const count = await Product.countDocuments(query);

    // --- 2. XỬ LÝ SẮP XẾP (SORT) ---
    let sortCondition = { createdAt: -1 }; // Mặc định: Mới nhất
    if (req.query.sort === 'price_asc') {
      sortCondition = { price: 1 }; // Giá: Thấp đến Cao
    } else if (req.query.sort === 'price_desc') {
      sortCondition = { price: -1 }; // Giá: Cao đến Thấp
    }

    // 5. Lấy dữ liệu theo trang
    const products = await Product.find(query)
      .sort(sortCondition)
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

// GỢI Ý THEO LỊCH SỬ XEM (Client gửi mảng productId đã xem)
const getHistoryBasedRecommendations = async (req, res) => {
  try {
    const { viewedProductIds = [], limit = 10 } = req.body || {};

    if (!Array.isArray(viewedProductIds)) {
      return res.status(400).json({ message: 'viewedProductIds phải là mảng' });
    }

    const normalizedIds = [...new Set(
      viewedProductIds
        .filter((id) => typeof id === 'string' && id.trim())
        .map((id) => id.trim())
    )].slice(-20);

    if (normalizedIds.length === 0) {
      return res.json([]);
    }

    const viewedProducts = await Product.find({ _id: { $in: normalizedIds } })
      .select('category compatibleModels');

    if (!viewedProducts.length) {
      return res.json([]);
    }

    const categories = [...new Set(viewedProducts.map((p) => p.category).filter(Boolean))];
    const compatibleModels = [...new Set(
      viewedProducts.flatMap((p) => Array.isArray(p.compatibleModels) ? p.compatibleModels : [])
    )];

    if (!categories.length && !compatibleModels.length) {
      return res.json([]);
    }

    const candidates = await Product.find({
      _id: { $nin: normalizedIds },
      $or: [
        { category: { $in: categories } },
        { compatibleModels: { $in: compatibleModels } },
      ],
    })
      .limit(60)
      .sort({ createdAt: -1 });

    const scored = candidates.map((product) => {
      let score = 0;
      if (categories.includes(product.category)) score += 2;

      const productModels = Array.isArray(product.compatibleModels) ? product.compatibleModels : [];
      const overlapCount = productModels.filter((m) => compatibleModels.includes(m)).length;
      score += overlapCount * 3;

      return { product, score };
    });

    const finalProducts = scored
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (b.product.rating || 0) - (a.product.rating || 0);
      })
      .slice(0, Math.max(1, Number(limit) || 10))
      .map((item) => item.product);

    res.json(finalProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      // Kiểm tra xem user này đã đánh giá sản phẩm này chưa
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này rồi!' });
      }

      // Tạo object đánh giá mới
      const review = {
        name: req.user.fullName, // Lấy tên từ token đăng nhập
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      // Thêm vào mảng reviews
      product.reviews.push(review);
      
      // Cập nhật tổng số lượng và điểm trung bình
      product.numReviews = product.reviews.length;
      product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

      await product.save();
      res.status(201).json({ message: 'Đã thêm đánh giá thành công' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LẤY CHI TIẾT SẢN PHẨM BẰNG ID (Dành cho Admin Edit)
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductBySlug, 
  createProduct,
  deleteProduct,
  updateProduct,
  getRecommendedProducts,
  getHistoryBasedRecommendations,
  createProductReview,
  getProductById,
};