const express = require('express');
const router = express.Router();
const { getProducts, getProductBySlug, createProduct, deleteProduct, updateProduct , getRecommendedProducts  } = require('../controllers/productController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');    

router.get('/', getProducts);
router.get('/recommend/:productId', getRecommendedProducts);
router.get('/:slug', getProductBySlug);
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;