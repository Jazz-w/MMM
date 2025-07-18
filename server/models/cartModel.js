const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update lastUpdated timestamp before saving
cartSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Method to calculate total cart value
cartSchema.methods.calculateTotal = async function() {
  try {
    console.log('calculateTotal - Starting calculation for cart:', this._id);
    
    // Ensure items are populated
    if (!this.populated('items.product')) {
      console.log('calculateTotal - Populating products');
      await this.populate('items.product');
    }

    console.log('calculateTotal - Items count:', this.items.length);
    
    let total = 0;
    for (const item of this.items) {
      if (!item.product) {
        console.log('calculateTotal - Missing product for item:', item._id);
        continue;
      }

      const price = item.product.discount && item.product.discount.percentage
        ? item.product.price * (1 - item.product.discount.percentage / 100)
        : item.product.price;
      
      total += price * item.quantity;
    }

    console.log('calculateTotal - Final total:', total);
    return total;
  } catch (error) {
    console.error('calculateTotal - Error:', error);
    throw error;
  }
};

// Method to add item to cart
cartSchema.methods.addItem = async function(productId, quantity = 1) {
  try {
    console.log('addItem - Starting for product:', productId);
    
    const existingItem = this.items.find(item => 
      item.product.toString() === productId.toString()
    );

    if (existingItem) {
      console.log('addItem - Updating existing item');
      existingItem.quantity += quantity;
    } else {
      console.log('addItem - Adding new item');
      this.items.push({ product: productId, quantity });
    }

    return this.save();
  } catch (error) {
    console.error('addItem - Error:', error);
    throw error;
  }
};

// Method to remove item from cart
cartSchema.methods.removeItem = async function(productId) {
  try {
    console.log('removeItem - Starting for product:', productId);
    
    this.items = this.items.filter(item => 
      item.product.toString() !== productId.toString()
    );
    
    console.log('removeItem - Items remaining:', this.items.length);
    return this.save();
  } catch (error) {
    console.error('removeItem - Error:', error);
    throw error;
  }
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = async function(productId, quantity) {
  try {
    console.log('updateItemQuantity - Starting for product:', productId);
    
    const item = this.items.find(item => 
      item.product.toString() === productId.toString()
    );
    
    if (!item) {
      console.error('updateItemQuantity - Item not found');
      throw new Error('Item not found in cart');
    }
    
    console.log('updateItemQuantity - Updating quantity to:', quantity);
    item.quantity = quantity;
    return this.save();
  } catch (error) {
    console.error('updateItemQuantity - Error:', error);
    throw error;
  }
};

// Method to clear cart
cartSchema.methods.clearCart = async function() {
  try {
    console.log('clearCart - Starting for cart:', this._id);
    
    this.items = [];
    return this.save();
  } catch (error) {
    console.error('clearCart - Error:', error);
    throw error;
  }
};

// Create indexes
cartSchema.index({ user: 1 });
cartSchema.index({ 'items.product': 1 });
cartSchema.index({ lastUpdated: -1 });

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart; 