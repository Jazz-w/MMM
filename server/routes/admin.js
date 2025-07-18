const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const { protect, admin } = require("../middleware/authMiddleware");
const { forceUpdateCollectionCounts } = require('../middleware/metricsMiddleware');
const { verifyAdmin } = require('../middleware/verifyAdmin');
// getDashboardStats is implemented inline in the /stats route below

// Add a simple route to update metrics
router.get('/update-metrics', async (req, res) => {
  try {
    await forceUpdateCollectionCounts();
    res.json({ success: true, message: 'Metrics updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Dashboard stats route is defined below as /stats

// Get all users
router.get("/users", protect, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get("/users/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new user
router.post("/users", protect, admin, async (req, res) => {
  const { firstName, lastName, email, password, phoneNumber, role } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      role: role || 'customer',
      isAdmin: role === 'admin'
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update user
router.put("/users/:id", protect, admin, async (req, res) => {
  try {
    const updates = req.body;
    
    // Handle role update
    if (updates.role) {
      updates.isAdmin = updates.role === 'admin';
    }

    const user = await User.findByIdAndUpdate(
      req.params.id, 
      updates,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete user
router.delete("/users/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get dashboard statistics
router.get("/stats", protect, admin, async (req, res) => {
  try {
    // User stats
    const totalUsers = await User.countDocuments();
    const customers = await User.countDocuments({ role: 'customer' });
    const admins = await User.countDocuments({ isAdmin: true });

    // Product stats
    const Product = require("../models/productModel");
    const Category = require("../models/categoryModel");
    const totalProducts = await Product.countDocuments();

    // Order stats
    const Order = require("../models/orderModel");
    const totalOrders = await Order.countDocuments();
    
    // Get all orders for status calculation and recent orders
    const allOrders = await Order.find()
      .populate('user', 'firstName lastName email')
      .sort('-createdAt');
    
    // Calculate total revenue ONLY from paid orders (status: 'payee')
    let totalRevenue = 0;
    const statusCounts = {};
    
    allOrders.forEach(order => {
      // Only add to revenue if order is paid
      if (order.status === 'payee') {
        totalRevenue += order.totalAmount; // Fixed: use totalAmount instead of total
      }
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });

    // Format orders by status
    const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count
    }));

    // Get recent orders (last 5)
    const recentOrders = allOrders.slice(0, 5).map(order => ({
      id: order._id,
      user: {
        firstName: order.user.firstName,
        lastName: order.user.lastName
      },
      totalAmount: order.totalAmount, // Fixed: use totalAmount instead of total
      status: order.status,
      createdAt: order.createdAt
    }));

    // Calculate daily revenue for the last 30 days (only from paid orders)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyRevenueMap = {};
    allOrders.forEach(order => {
      if (order.status === 'payee' && order.createdAt >= thirtyDaysAgo) {
        const dateStr = order.createdAt.toISOString().split('T')[0];
        dailyRevenueMap[dateStr] = (dailyRevenueMap[dateStr] || 0) + order.totalAmount;
      }
    });

    const dailyRevenue = Object.entries(dailyRevenueMap)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate top products (only from paid orders)
    const topProducts = await Order.aggregate([
      { $match: { status: 'payee' } }, // Only include paid orders
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          product: {
            id: "$_id",
            name: "$productDetails.name",
            image: "$productDetails.image"
          },
          totalSold: 1,
          revenue: 1
        }
      }
    ]);

    // Calculate category distribution
    const categoryDistribution = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$category",
          productCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryDetails"
        }
      },
      { $unwind: "$categoryDetails" },
      {
        $project: {
          category: {
            id: "$_id",
            name: "$categoryDetails.name"
          },
          productCount: 1,
          percentage: {
            $multiply: [
              { $divide: ["$productCount", totalProducts] },
              100
            ]
          }
        }
      },
      { $sort: { productCount: -1 } }
    ]);

    // Calculate customer activity (simplified - using order creation dates as activity)
    const customerActivity = [];
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }

    last7Days.forEach(dateStr => {
      const dayOrders = allOrders.filter(order => {
        const orderDate = order.createdAt.toISOString().split('T')[0];
        return orderDate === dateStr;
      });
      
      customerActivity.push({
        date: dateStr,
        visits: dayOrders.length // Using order count as proxy for visits
      });
    });

    res.json({
      totalUsers,
      customers,
      admins,
      totalOrders,
      totalProducts,
      totalRevenue, // This now correctly reflects only paid orders
      recentOrders,
      topProducts,
      ordersByStatus,
      dailyRevenue, // Added daily revenue for dashboard charts
      categoryDistribution,
      customerActivity
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Products admin routes
router.get("/products", protect, admin, async (req, res) => {
  try {
    const Product = require("../models/productModel");
    const products = await Product.find().populate('category');
    
    // Transform products to match frontend expectations
    const transformedProducts = products.map(product => ({
      ...product.toObject(),
      id: product._id.toString(),
      image: product.images && product.images.length > 0 ? product.images[0].url : ''
    }));
    
    res.json(transformedProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/products", protect, admin, async (req, res) => {
  try {
    const Product = require("../models/productModel");
    const { name, description, price, stock, image, categoryId, isActive = true } = req.body;
    
    console.log('Creating product with data:', { name, description, price, stock, image, categoryId, isActive });
    
    // Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: "Le nom du produit est requis" });
    }
    if (!description || description.trim() === '') {
      return res.status(400).json({ error: "La description du produit est requise" });
    }
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      return res.status(400).json({ error: "Le prix du produit doit être un nombre positif" });
    }
    if (!stock || isNaN(parseInt(stock)) || parseInt(stock) < 0) {
      return res.status(400).json({ error: "Le stock du produit doit être un nombre entier positif" });
    }
    if (!categoryId) {
      return res.status(400).json({ error: "La catégorie du produit est requise" });
    }
    
    // Transform frontend data to match backend model
    const productData = {
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      stock: parseInt(stock),
      category: categoryId,
      brand: 'ParaPharmacie', // Default brand
      images: image ? [{ url: image, isMain: true }] : [],
      isActive
    };
    
    console.log('Final product data:', productData);
    
    const product = await Product.create(productData);
    
    // Transform product to match frontend expectations
    const transformedProduct = {
      ...product.toObject(),
      id: product._id.toString(),
      image: product.images && product.images.length > 0 ? product.images[0].url : ''
    };
    
    res.status(201).json({ success: true, product: transformedProduct });
  } catch (error) {
    console.error('Product creation error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: `Erreur de validation: ${messages.join(', ')}` });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ error: "ID de catégorie invalide" });
    }
    res.status(400).json({ error: error.message || 'Erreur lors de la création du produit' });
  }
});

router.put("/products/:id", protect, admin, async (req, res) => {
  try {
    const Product = require("../models/productModel");
    const { name, description, price, stock, image, categoryId, isActive } = req.body;
    
    // Transform frontend data to match backend model
    const updateData = {
      ...(name && { name }),
      ...(description && { description }),
      ...(price && { price: parseFloat(price) }),
      ...(stock !== undefined && { stock: parseInt(stock) }),
      ...(categoryId && { category: categoryId }),
      ...(isActive !== undefined && { isActive })
    };
    
    // Handle image update
    if (image !== undefined) {
      updateData.images = image ? [{ url: image, isMain: true }] : [];
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('category');
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    // Transform product to match frontend expectations
    const transformedProduct = {
      ...product.toObject(),
      id: product._id.toString(),
      image: product.images && product.images.length > 0 ? product.images[0].url : ''
    };
    
    res.json({ success: true, product: transformedProduct });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/products/:id", protect, admin, async (req, res) => {
  try {
    const Product = require("../models/productModel");
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Categories admin routes
router.get("/categories", protect, admin, async (req, res) => {
  try {
    const Category = require("../models/categoryModel");
    const categories = await Category.find();
    
    // Transform categories to match frontend expectations
    const transformedCategories = categories.map(category => ({
      ...category.toObject(),
      id: category._id.toString()
    }));
    
    res.json(transformedCategories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/categories", protect, admin, async (req, res) => {
  try {
    const Category = require("../models/categoryModel");
    const { name, description = '', image, isActive = true } = req.body;
    
    console.log('=== CATEGORY CREATION DEBUG ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Extracted data:', { name, description, image, isActive });
    console.log('Name type:', typeof name, 'Name value:', name);
    console.log('Description type:', typeof description, 'Description value:', description);
    
    // Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: "Le nom de la catégorie est requis" });
    }
    
    // Generate a unique slug from the name
    const baseSlug = name.trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    // Check if a category with this slug already exists
    const existingCategory = await Category.findOne({ slug: baseSlug });
    let finalSlug = baseSlug;
    
    if (existingCategory) {
      // If slug exists, append a timestamp to make it unique
      finalSlug = `${baseSlug}-${Date.now()}`;
    }

    const categoryData = {
      name: name.trim(),
      description: description.trim() || `Catégorie ${name.trim()}`,
      image: image || '',
      isActive,
      slug: finalSlug
    };
    
    console.log('Final category data:', JSON.stringify(categoryData, null, 2));
    
    const category = await Category.create(categoryData);
    
    // Transform category to match frontend expectations
    const transformedCategory = {
      ...category.toObject(),
      id: category._id.toString()
    };
    
    console.log('Created category successfully:', transformedCategory);
    res.status(201).json({ success: true, category: transformedCategory });
  } catch (error) {
    console.error('=== CATEGORY CREATION ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: `Validation failed: ${messages.join(', ')}` });
    }
    
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      console.error('Duplicate key error on field:', field);
      return res.status(400).json({ error: `Une catégorie avec ce ${field} existe déjà` });
    }
    
    console.error('Unknown error occurred');
    res.status(400).json({ error: error.message || 'Erreur lors de la création de la catégorie' });
  }
});

router.put("/categories/:id", protect, admin, async (req, res) => {
  try {
    const Category = require("../models/categoryModel");
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    
    // Transform category to match frontend expectations
    const transformedCategory = {
      ...category.toObject(),
      id: category._id.toString()
    };
    
    res.json({ success: true, category: transformedCategory });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/categories/:id", protect, admin, async (req, res) => {
  try {
    const Category = require("../models/categoryModel");
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    
    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Orders admin routes
router.get("/orders", protect, admin, async (req, res) => {
  try {
    const Order = require("../models/orderModel");
    const orders = await Order.find()
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });
    
    // Transform orders to match frontend expectations
    const transformedOrders = orders.map(order => ({
      ...order.toObject(),
      id: order._id.toString(), // Ensure ID is a string
      total: order.totalAmount // Map totalAmount to total for frontend compatibility
    }));
    
    console.log('Transformed orders sample:', transformedOrders.slice(0, 1)); // Debug log
    res.json(transformedOrders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/orders/:id", protect, admin, async (req, res) => {
  try {
    const Order = require("../models/orderModel");
    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email phoneNumber')
      .populate('items.product', 'name price image');
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/orders/:id/status", protect, admin, async (req, res) => {
  try {
    const Order = require("../models/orderModel");
    const { status } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'firstName lastName email');
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    res.json({ success: true, order });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;