const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getUserOrderStats
} = require('../controllers/orderController');

// All routes require authentication
router.use(protect);

// @route   POST /api/orders
// @desc    Create a new order from cart
// @access  Private
router.post('/', createOrder);

// @route   GET /api/orders
// @desc    Get user's order history with pagination and filters
// @access  Private
router.get('/', getUserOrders);

// @route   GET /api/orders/stats
// @desc    Get user's order statistics
// @access  Private
router.get('/stats', getUserOrderStats);

// @route   GET /api/orders/:orderId
// @desc    Get single order details
// @access  Private
router.get('/:orderId', getOrderById);

// @route   PUT /api/orders/:orderId/cancel
// @desc    Cancel an order
// @access  Private
router.put('/:orderId/cancel', cancelOrder);

module.exports = router; 