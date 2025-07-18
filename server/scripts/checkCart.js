const mongoose = require('mongoose');
const Cart = require('../models/cartModel');

async function checkCart() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://127.0.0.1:27017/parapharm');
    console.log('Connected to MongoDB');

    const carts = await Cart.find().populate('items.product');
    
    console.log('\nFound', carts.length, 'carts');
    
    carts.forEach((cart, index) => {
      console.log(`\nCart ${index + 1}:`, {
        _id: cart._id,
        user: cart.user,
        itemCount: cart.items.length
      });

      cart.items.forEach((item, itemIndex) => {
        console.log(`\nItem ${itemIndex + 1}:`, {
          _id: item._id,
          product: item.product ? {
            _id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            type: typeof item.product.price
          } : 'No product',
          quantity: item.quantity,
          type: typeof item.quantity
        });
      });
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkCart(); 