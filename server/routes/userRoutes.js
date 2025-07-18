const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  registerUser,
  loginUser,
  updateUserProfile,
  getUserProfile
} = require('../controllers/userController');

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Cart routes
router.get('/cart', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.items.product');
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/cart', protect, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const user = await User.findById(req.user._id);
    await user.addToCart(productId, quantity);
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/cart/:productId', protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    const user = await User.findById(req.user._id);
    const cartItem = user.cart.items.find(item => 
      item.product.toString() === req.params.productId
    );

    if (!cartItem) {
      return res.status(404).json({ error: 'Product not found in cart' });
    }

    cartItem.quantity = quantity;
    await user.save();
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/cart/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    await user.removeFromCart(req.params.productId);
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Wishlist routes
router.get('/wishlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/wishlist/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.wishlist.includes(req.params.productId)) {
      user.wishlist.push(req.params.productId);
      await user.save();
    }
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/wishlist/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter(id => 
      id.toString() !== req.params.productId
    );
    await user.save();
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;