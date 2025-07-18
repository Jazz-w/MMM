const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');

// Create a new order from cart
exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, notes, deliveryType = 'pickup' } = req.body;
    const userId = req.user._id;

    console.log('CreateOrder - Request body:', req.body);
    console.log('CreateOrder - User ID:', userId);

    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Validate stock availability for all items
    for (const item of cart.items) {
      if (!item.product) {
        return res.status(400).json({
          success: false,
          message: 'One or more products are no longer available'
        });
      }

      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.product.name}. Available: ${item.product.stock}, Requested: ${item.quantity}`
        });
      }
    }

    // Calculate order totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const price = item.product.discount && item.product.discount.percentage
        ? item.product.price * (1 - item.product.discount.percentage / 100)
        : item.product.price;
      
      const discount = item.product.discount && item.product.discount.percentage
        ? (item.product.price * item.product.discount.percentage / 100) * item.quantity
        : 0;

      orderItems.push({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
        discount: discount
      });

      subtotal += price * item.quantity;
    }

    // For pickup orders, no shipping cost
    const shippingCost = deliveryType === 'pickup' ? 0 : 0; // No shipping for pickup
    const tax = subtotal * 0.18; // 18% tax rate for Tunisia
    const totalAmount = subtotal + shippingCost + tax;

    // Create order
    const order = new Order({
      user: userId,
      items: orderItems,
      shippingAddress: deliveryType === 'pickup' ? {
        street: 'Store Pickup',
        city: 'Tunis',
        state: 'Tunis',
        postalCode: '1000',
        country: 'Tunisia'
      } : shippingAddress,
      paymentInfo: {
        method: 'cash_on_delivery',
        status: 'pending'
      },
      status: 'pending',
      subtotal,
      shippingCost,
      tax,
      totalAmount,
      notes: notes || '',
      deliveryType,
      statusHistory: [{
        status: 'pending',
        date: new Date(),
        note: deliveryType === 'pickup' ? 'Order placed for store pickup' : 'Order placed'
      }]
    });

    await order.save();

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: [] } }
    );

    // Populate order details for response
    await order.populate([
      {
        path: 'items.product',
        select: 'name price images'
      },
      {
        path: 'user',
        select: 'firstName lastName email phoneNumber'
      }
    ]);

    res.status(201).json({
      success: true,
      message: deliveryType === 'pickup' 
        ? 'Order placed successfully! Please come to store for pickup.' 
        : 'Order placed successfully!',
      order: {
        _id: order._id,
        orderNumber: order._id.toString().slice(-8).toUpperCase(),
        items: order.items,
        totalAmount: order.totalAmount,
        status: order.status,
        deliveryType: order.deliveryType,
        createdAt: order.createdAt,
        estimatedPickupDate: deliveryType === 'pickup' 
          ? new Date(Date.now() + 24 * 60 * 60 * 1000) // Next day
          : null
      }
    });

  } catch (error) {
    console.error('CreateOrder - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// Get user's order history
exports.getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user._id;

    // Build query
    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const orders = await Order.find(query)
      .populate({
        path: 'items.product',
        select: 'name price images'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Order.countDocuments(query);

    // Format orders for response
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      orderNumber: order._id.toString().slice(-8).toUpperCase(),
      items: order.items.map(item => ({
        product: {
          _id: item.product._id,
          name: item.product.name,
          image: item.product.images?.[0]?.url || '',
        },
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: order.totalAmount,
      status: order.status,
      deliveryType: order.deliveryType,
      paymentStatus: order.paymentInfo.status,
      createdAt: order.createdAt,
      estimatedPickupDate: order.deliveryType === 'pickup' 
        ? new Date(order.createdAt.getTime() + 24 * 60 * 60 * 1000)
        : null
    }));

    res.json({
      success: true,
      orders: formattedOrders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: skip + orders.length < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('GetUserOrders - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Get single order details
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate([
        {
          path: 'items.product',
          select: 'name price images description'
        },
        {
          path: 'user',
          select: 'firstName lastName email phoneNumber'
        }
      ]);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order: {
        _id: order._id,
        orderNumber: order._id.toString().slice(-8).toUpperCase(),
        items: order.items,
        shippingAddress: order.shippingAddress,
        paymentInfo: order.paymentInfo,
        status: order.status,
        deliveryType: order.deliveryType,
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        tax: order.tax,
        totalAmount: order.totalAmount,
        notes: order.notes,
        statusHistory: order.statusHistory,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        estimatedPickupDate: order.deliveryType === 'pickup' 
          ? new Date(order.createdAt.getTime() + 24 * 60 * 60 * 1000)
          : null
      }
    });

  } catch (error) {
    console.error('GetOrderById - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details',
      error: error.message
    });
  }
};

// Cancel order (user can cancel if not processed)
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate('items.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled. It is already being processed.'
      });
    }

    // Restore product stock
    for (const item of order.items) {
      if (item.product) {
        await Product.findByIdAndUpdate(
          item.product._id,
          { $inc: { stock: item.quantity } }
        );
      }
    }

    // Update order status
    order.status = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      date: new Date(),
      note: reason || 'Cancelled by customer'
    });

    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order: {
        _id: order._id,
        status: order.status,
        statusHistory: order.statusHistory
      }
    });

  } catch (error) {
    console.error('CancelOrder - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
};

// Get order statistics for user dashboard
exports.getUserOrderStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Order.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments({ user: userId });
    const totalSpent = await Order.aggregate([
      { $match: { user: userId, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalSpent: totalSpent[0]?.total || 0,
        ordersByStatus: stats
      }
    });

  } catch (error) {
    console.error('GetUserOrderStats - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics',
      error: error.message
    });
  }
}; 

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total users
    const [users, totalOrders, recentOrders, orderStats, revenue] = await Promise.all([
      User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]),
      Order.countDocuments(),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'firstName lastName email'),
      Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      Order.aggregate([
        {
          $match: {
            status: 'payee',
            createdAt: {
              $gte: new Date(new Date().setDate(new Date().getDate() - 30))
            }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            revenue: { $sum: '$totalAmount' }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ])
    ]);

    // Calculate user stats
    const userStats = users.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    // Calculate order stats
    const ordersByStatus = orderStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    // Calculate total revenue from paid orders
    const totalRevenue = revenue.reduce((sum, day) => sum + day.revenue, 0);

    // Format daily revenue
    const dailyRevenue = revenue.map(day => ({
      date: day._id,
      revenue: day.revenue
    }));

    res.json({
      success: true,
      stats: {
        totalUsers: Object.values(userStats).reduce((a, b) => a + b, 0),
        customers: userStats.customer || 0,
        admins: userStats.admin || 0,
        totalOrders,
        totalRevenue,
        ordersByStatus,
        recentOrders,
        dailyRevenue
      }
    });
  } catch (error) {
    console.error('GetDashboardStats - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
}; 