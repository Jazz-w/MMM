const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
    price: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    }
  }],
  shippingAddress: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    postalCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'Tunisia'
    }
  },
  paymentInfo: {
    method: {
      type: String,
      required: true,
      enum: ['cash_on_delivery', 'credit_card', 'debit_card']
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'pret_a_porter', 'payee', 'cancelled'],
    default: 'pending'
  },
  subtotal: {
    type: Number,
    required: true
  },
  shippingCost: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  deliveryType: {
    type: String,
    enum: ['pickup', 'delivery'],
    default: 'pickup'
  },
  trackingNumber: String,
  estimatedDeliveryDate: Date,
  estimatedPickupDate: Date,
  notes: String,
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    note: String
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'paymentInfo.status': 1 });
orderSchema.index({ trackingNumber: 1 });

// Calculate totals before saving
orderSchema.pre('save', function(next) {
  // Calculate subtotal
  this.subtotal = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity - item.discount);
  }, 0);

  // Add shipping and tax
  this.totalAmount = this.subtotal + this.shippingCost + this.tax;

  // Add status to history if changed
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      date: new Date(),
      note: this.status === 'payee' ? 'Commande payée' : ''
    });
  }

  next();
});

// Instance method to cancel order
orderSchema.methods.cancelOrder = async function(reason) {
  if (this.status === 'payee') {
    throw new Error('Cannot cancel a paid order');
  }

  this.status = 'cancelled';
  this.statusHistory.push({
    status: 'cancelled',
    date: new Date(),
    note: reason
  });

  await this.save();
  return this;
};

// Static method to get user's order statistics
orderSchema.statics.getUserOrderStats = async function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: { 
          $cond: [
            { $eq: ['$status', 'payee'] }, 
            '$totalAmount', 
            0
          ]
        }}
      }
    }
  ]);
};

// Static method to get total revenue (only from paid orders)
orderSchema.statics.getTotalRevenue = async function() {
  const result = await this.aggregate([
    { 
      $match: { 
        status: 'payee',
        createdAt: { 
          $gte: new Date(new Date().setDate(new Date().getDate() - 30)) // Last 30 days
        }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        dailyRevenue: {
          $push: {
            date: { 
              $dateToString: { 
                format: '%Y-%m-%d', 
                date: '$createdAt' 
              }
            },
            amount: '$totalAmount'
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalRevenue: 1,
        dailyRevenue: {
          $reduce: {
            input: '$dailyRevenue',
            initialValue: [],
            in: {
              $concatArrays: [
                '$$value',
                [{
                  date: '$$this.date',
                  revenue: '$$this.amount'
                }]
              ]
            }
          }
        }
      }
    }
  ]);

  return result[0] || { totalRevenue: 0, dailyRevenue: [] };
};

const Order = mongoose.model('Order', orderSchema);
module.exports = Order; 