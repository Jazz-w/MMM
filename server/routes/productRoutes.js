const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', productController.getProducts);
router.get('/categories', productController.getCategories);
router.get('/category/:slug', productController.getProductsByCategory);
router.get('/sale', productController.getProductsOnSale);
router.get('/featured', productController.getFeaturedProducts);

// Protected cart routes
router.post('/cart', protect, productController.addToCart);
router.get('/cart', protect, productController.getCart);
router.put('/cart/:itemId', protect, productController.updateCartItem);
router.delete('/cart/:itemId', protect, productController.removeFromCart);
router.delete('/cart', protect, productController.clearCart);

// Product detail route
router.get('/:id', productController.getProductById);

// Admin routes
router.post('/', protect, admin, productController.createProduct);
router.put('/:id', protect, admin, productController.updateProduct);
router.delete('/:id', protect, admin, productController.deleteProduct);
router.post('/categories', protect, admin, productController.createCategory);
router.put('/categories/:id', protect, admin, productController.updateCategory);
router.delete('/categories/:id', protect, admin, productController.deleteCategory);

module.exports = router; 