const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  specifications: {
    weight: String,
    dimensions: String,
    ingredients: [String],
    usage: String,
    warnings: [String],
    storageInstructions: String
  },
  tags: [String],
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    review: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  discount: {
    percentage: {
      type: Number,
      min: 0,
      max: 100
    },
    startDate: Date,
    endDate: Date
  }
}, {
  timestamps: true
});

// Calculate average rating before saving
productSchema.pre('save', function(next) {
  if (this.ratings.length > 0) {
    const totalRating = this.ratings.reduce((acc, item) => acc + item.rating, 0);
    this.averageRating = totalRating / this.ratings.length;
  }
  next();
});

// Method to check if product is in stock
productSchema.methods.isInStock = function() {
  return this.stock > 0;
};

// Method to calculate discounted price
productSchema.methods.getDiscountedPrice = function() {
  if (!this.discount || !this.discount.percentage) return this.price;
  
  const now = new Date();
  if (this.discount.startDate && this.discount.startDate > now) return this.price;
  if (this.discount.endDate && this.discount.endDate < now) return this.price;
  
  return this.price * (1 - this.discount.percentage / 100);
};

// Create indexes
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ 'discount.endDate': 1 });
productSchema.index({ averageRating: -1 });

const Product = mongoose.model('Product', productSchema);
module.exports = Product; 