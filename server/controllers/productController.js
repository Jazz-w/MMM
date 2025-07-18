const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const User = require('../models/userModel');
const Cart = require('../models/cartModel');

// Get all products with filters
exports.getProducts = async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      brand,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    // Build query
    const query = {};

    // Category filter
    if (category) {
      query.category = category;
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Brand filter
    if (brand) {
      query.brand = { $regex: brand, $options: 'i' };
    }

    // Only show active products
    query.isActive = true;

    // Build sort options
    let sortOptions = {};
    switch (sort) {
      case 'price_asc':
        sortOptions = { price: 1 };
        break;
      case 'price_desc':
        sortOptions = { price: -1 };
        break;
      case 'name_asc':
        sortOptions = { name: 1 };
        break;
      case 'name_desc':
        sortOptions = { name: -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'rating':
        sortOptions = { averageRating: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('category', 'name slug');

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    res.json({
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des catégories' });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('ratings.user', 'firstName lastName');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching product',
      error: error.message
    });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const products = await Product.find({
      category: category._id,
      isActive: true
    }).populate('category', 'name slug');

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching products by category',
      error: error.message
    });
  }
};

// Get featured products
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      averageRating: { $gte: 4 }
    })
      .sort({ averageRating: -1 })
      .limit(6)
      .populate('category', 'name slug');

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching featured products',
      error: error.message
    });
  }
};

// Get products on sale
exports.getProductsOnSale = async (req, res) => {
  try {
    const now = new Date();
    const products = await Product.find({
      isActive: true,
      'discount.percentage': { $gt: 0 },
      'discount.startDate': { $lte: now },
      'discount.endDate': { $gte: now }
    })
      .sort({ 'discount.percentage': -1 })
      .limit(12)
      .populate('category', 'name slug');

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching products on sale',
      error: error.message
    });
  }
};

// Add product rating
exports.addProductRating = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user has already rated
    const existingRating = product.ratings.find(
      r => r.user.toString() === req.user._id.toString()
    );

    if (existingRating) {
      return res.status(400).json({ message: 'You have already rated this product' });
    }

    product.ratings.push({
      user: req.user._id,
      rating,
      review,
      date: new Date()
    });

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: 'Error adding product rating',
      error: error.message
    });
  }
};

// Get product suggestions
exports.getProductSuggestions = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get similar products from same category
    const suggestions = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true
    })
      .limit(4)
      .populate('category', 'name slug');

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching product suggestions',
      error: error.message
    });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      brand,
      stock,
      specifications,
      tags
    } = req.body;

    const product = new Product({
      name,
      description,
      price,
      category,
      brand,
      stock,
      specifications,
      tags,
      images: [] // Will be updated when images are uploaded
    });

    await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product: await product.populate('category', 'name slug')
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating product',
      error: error.message
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      brand,
      stock,
      specifications,
      tags,
      isActive,
      discount
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update fields if provided
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (brand) product.brand = brand;
    if (stock !== undefined) product.stock = stock;
    if (specifications) product.specifications = specifications;
    if (tags) product.tags = tags;
    if (isActive !== undefined) product.isActive = isActive;
    if (discount) product.discount = discount;

    await product.save();

    res.json({
      message: 'Product updated successfully',
      product: await product.populate('category', 'name slug')
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating product',
      error: error.message
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Soft delete by setting isActive to false
    product.isActive = false;
    await product.save();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting product',
      error: error.message
    });
  }
};

// Update product stock
exports.updateStock = async (req, res) => {
  try {
    const { stock } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.stock = stock;
    await product.save();

    res.json({
      message: 'Stock updated successfully',
      stock: product.stock
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating stock',
      error: error.message
    });
  }
};

// Add product image
exports.addProductImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { imageUrl, isMain } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required' });
    }

    // If new image is main, remove main flag from other images
    if (isMain) {
      product.images.forEach(img => img.isMain = false);
    }

    product.images.push({
      url: imageUrl,
      isMain: isMain || false
    });

    await product.save();

    res.json({
      message: 'Image added successfully',
      images: product.images
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error adding image',
      error: error.message
    });
  }
};

// Remove product image
exports.removeProductImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.images = product.images.filter(
      img => img._id.toString() !== imageId
    );

    await product.save();

    res.json({
      message: 'Image removed successfully',
      images: product.images
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error removing image',
      error: error.message
    });
  }
};

// Set main product image
exports.setMainImage = async (req, res) => {
  try {
    const { imageId } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Remove main flag from all images
    product.images.forEach(img => {
      img.isMain = img._id.toString() === imageId;
    });

    await product.save();

    res.json({
      message: 'Main image updated successfully',
      images: product.images
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating main image',
      error: error.message
    });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID or quantity'
      });
    }

    // Check if product exists and is active
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or is no longer available'
      });
    }

    // Check stock availability
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Requested quantity exceeds available stock'
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [{ product: productId, quantity }]
      });
    } else {
      // Check if product already exists in cart
      const existingItem = cart.items.find(item => 
        item.product.toString() === productId.toString()
      );

      if (existingItem) {
        // Update quantity if product exists
        existingItem.quantity += quantity;
        
        // Check if new total quantity exceeds stock
        if (existingItem.quantity > product.stock) {
          return res.status(400).json({
            success: false,
            message: 'Total quantity would exceed available stock'
          });
        }
      } else {
        // Add new item if product doesn't exist in cart
        cart.items.push({ product: productId, quantity });
      }

      await cart.save();
    }

    // Populate product details
    await cart.populate({
      path: 'items.product',
      select: 'name price images discount stock'
    });

    // Calculate total
    const totalAmount = await cart.calculateTotal();

    res.json({
      success: true,
      items: cart.items,
      totalAmount
    });
  } catch (error) {
    console.error('AddToCart - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message
    });
  }
};

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    console.log('GetCart - Starting for user:', req.user._id);
    
    const cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name price images discount stock',
        match: { _id: { $exists: true } }
      });
    
    if (!cart) {
      return res.json({
        success: true,
        items: [],
        totalAmount: 0
      });
    }

    // Filter out any items where the product no longer exists
    const validItems = cart.items.filter(item => item.product != null);
    
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    // Map items for response
    const items = validItems.map(item => ({
      _id: item._id,
      product: {
        _id: item.product._id,
        name: item.product.name,
        price: item.product.price,
        images: item.product.images,
        discount: item.product.discount,
        stock: item.product.stock
      },
      quantity: item.quantity
    }));

    // Calculate total using the model's method
    const totalAmount = await cart.calculateTotal();

    // Log the calculation details
    console.log('GetCart - Calculation details:', {
      itemCount: items.length,
      items: items.map(item => ({
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        discount: item.product.discount
      })),
      totalAmount
    });

    // Send response with calculated total
    res.json({
      success: true,
      items: items,
      totalAmount: totalAmount
    });

  } catch (error) {
    console.error('GetCart - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      error: error.message
    });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quantity'
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Find the cart item
    const cartItem = cart.items.find(item => item._id.toString() === itemId);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // Check if product still exists and is active
    const product = await Product.findOne({ 
      _id: cartItem.product,
      isActive: true
    });

    if (!product) {
      // Remove the item if product no longer exists or is inactive
      cart.items = cart.items.filter(item => item._id.toString() !== itemId);
      await cart.save();
      
      return res.status(404).json({
        success: false,
        message: 'Product no longer available'
      });
    }

    // Check stock availability
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Requested quantity exceeds available stock'
      });
    }

    // Update quantity
    cartItem.quantity = quantity;
    await cart.save();

    // Populate product details
    await cart.populate({
      path: 'items.product',
      select: 'name price images discount stock'
    });

    // Calculate new total
    const totalAmount = await cart.calculateTotal();

    res.json({
      success: true,
      items: cart.items,
      totalAmount
    });
  } catch (error) {
    console.error('UpdateCartItem - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: error.message
    });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Remove the item
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();

    // Populate product details
    await cart.populate({
      path: 'items.product',
      select: 'name price images discount stock'
    });

    // Calculate new total
    const totalAmount = await cart.calculateTotal();

    res.json({
      success: true,
      items: cart.items,
      totalAmount
    });
  } catch (error) {
    console.error('RemoveFromCart - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: error.message
    });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      items: [],
      totalAmount: 0
    });
  } catch (error) {
    console.error('ClearCart - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
};

// Create new category (admin only)
exports.createCategory = async (req, res) => {
  try {
    const category = new Category({
      name: req.body.name,
      slug: req.body.name.toLowerCase().replace(/\s+/g, '-'),
      description: req.body.description,
      imageUrl: req.body.imageUrl
    });

    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de la catégorie' });
  }
};

// Update category (admin only)
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      category.name = req.body.name || category.name;
      category.slug = req.body.name ? req.body.name.toLowerCase().replace(/\s+/g, '-') : category.slug;
      category.description = req.body.description || category.description;
      category.imageUrl = req.body.imageUrl || category.imageUrl;

      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Catégorie non trouvée' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la catégorie' });
  }
};

// Delete category (admin only)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      await category.deleteOne();
      res.json({ message: 'Catégorie supprimée' });
    } else {
      res.status(404).json({ message: 'Catégorie non trouvée' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la catégorie' });
  }
}; 