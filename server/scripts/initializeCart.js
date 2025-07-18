require('dotenv').config();
const mongoose = require('mongoose');
const Cart = require('../models/cartModel');
const User = require('../models/userModel');

async function initializeCart() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Ensure indexes
    console.log('Creating indexes...');
    await Cart.collection.createIndex({ user: 1 }, { unique: true });
    await Cart.collection.createIndex({ 'items.product': 1 });
    await Cart.collection.createIndex({ lastUpdated: -1 });
    console.log('Indexes created');

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    // Create carts for users who don't have one
    for (const user of users) {
      const existingCart = await Cart.findOne({ user: user._id });
      if (!existingCart) {
        console.log(`Creating cart for user: ${user._id}`);
        await Cart.create({
          user: user._id,
          items: []
        });
      }
    }

    console.log('Cart initialization complete');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing cart:', error);
    process.exit(1);
  }
}

initializeCart(); 