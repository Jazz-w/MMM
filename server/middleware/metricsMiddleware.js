const client = require('prom-client');

// Create a Registry
const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

const dbConnectionStatus = new client.Gauge({
  name: 'mongodb_connection_status',
  help: 'MongoDB connection status (1 = connected, 0 = disconnected)'
});

// Business metrics
const userRegistrations = new client.Counter({
  name: 'user_registrations_total',
  help: 'Total number of user registrations'
});

const productViews = new client.Counter({
  name: 'product_views_total',
  help: 'Total number of product views'
});

const ordersTotal = new client.Counter({
  name: 'orders_total',
  help: 'Total number of orders',
  labelNames: ['status']
});

const cartOperations = new client.Counter({
  name: 'cart_operations_total',
  help: 'Total number of cart operations',
  labelNames: ['operation'] // add, remove, update
});

// Database collection count metrics
const userCount = new client.Gauge({
  name: 'mongodb_users_total',
  help: 'Total number of users in the database'
});

const productCount = new client.Gauge({
  name: 'mongodb_products_total',
  help: 'Total number of products in the database'
});

// Immediately set initial values
userCount.set(0);
productCount.set(0);

// Register metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(activeConnections);
register.registerMetric(dbConnectionStatus);
register.registerMetric(userRegistrations);
register.registerMetric(productViews);
register.registerMetric(ordersTotal);
register.registerMetric(cartOperations);
register.registerMetric(userCount);
register.registerMetric(productCount);

// Initialize metrics with default values
userCount.set(0);
productCount.set(0);
dbConnectionStatus.set(0);
activeConnections.set(0);

// Initialize collection counts on startup
const initializeCollectionCounts = async () => {
  try {
    // Wait for database to be ready
    setTimeout(async () => {
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState === 1) {
        await updateCollectionCounts();
      } else {
        console.log('METRICS: Database not ready during initialization, will retry...');
        setTimeout(initializeCollectionCounts, 5000); // Retry in 5 seconds
      }
    }, 3000); // Wait 3 seconds initially
  } catch (error) {
    console.error('METRICS: Error initializing collection counts:', error);
  }
};

// Start initialization
initializeCollectionCounts();

// Also force an immediate update when the module loads
setTimeout(() => {
  updateCollectionCounts();
}, 1000); // Run after 1 second

// And again after 5 seconds to ensure it works
setTimeout(() => {
  updateCollectionCounts();
}, 5000);

// Middleware function
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Track active connections
  activeConnections.inc();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    const method = req.method;
    const status = res.statusCode;
    
    // Record HTTP metrics
    httpRequestDuration
      .labels(method, route, status)
      .observe(duration);
    
    httpRequestsTotal
      .labels(method, route, status)
      .inc();
    
    // Track business metrics based on successful API calls
    if (status >= 200 && status < 300) {
      trackBusinessMetrics(method, req.path, req.body);
    }
    
    // Decrease active connections
    activeConnections.dec();
  });
  
  next();
};

// Function to track business metrics based on API patterns
const trackBusinessMetrics = (method, path, body) => {
  try {
    console.log('METRICS: Checking path:', method, path);
    
    // Product view tracking - individual product requests
    if (method === 'GET' && path.match(/^\/api\/products\/[a-fA-F0-9]{24}$/)) {
      console.log('METRICS: Auto-tracking product view for path:', path);
      productViews.inc();
    }
    
    // Cart operation tracking
    if (path.includes('/api/products/cart')) {
      let operation = 'unknown';
      
      if (method === 'POST' && path === '/api/products/cart') {
        operation = 'add';
      } else if (method === 'PUT' && path.includes('/api/products/cart/')) {
        operation = 'update';
      } else if (method === 'DELETE' && path.includes('/api/products/cart/')) {
        operation = 'remove';
      } else if (method === 'DELETE' && path === '/api/products/cart') {
        operation = 'clear';
      }
      
      if (operation !== 'unknown') {
        console.log('METRICS: Auto-tracking cart operation:', operation, 'for path:', path);
        cartOperations.labels(operation).inc();
      }
    }
    
    // User registration tracking - check multiple possible paths
    if (method === 'POST' && (path === '/api/auth/register' || path === '/register' || path.includes('register'))) {
      console.log('METRICS: Auto-tracking user registration for path:', path);
      userRegistrations.inc();
    }
    
    // Order tracking
    if (method === 'POST' && path.includes('/api/orders')) {
      console.log('METRICS: Auto-tracking order creation for path:', path);
      ordersTotal.labels('pending').inc();
    }
    
  } catch (error) {
    console.error('METRICS: Error in business metrics tracking:', error);
  }
};

// Function to update MongoDB connection status
const updateDbConnectionStatus = (status) => {
  dbConnectionStatus.set(status ? 1 : 0);
};

// Function to update collection counts
const updateCollectionCounts = async () => {
  try {
    const mongoose = require('mongoose');
    console.log('METRICS: Checking database connection, readyState:', mongoose.connection.readyState);
    
    if (mongoose.connection.readyState === 1) {
      const User = require('../models/userModel');
      const Product = require('../models/productModel');
      
      // Update user count
      console.log('METRICS: Counting users in database...');
      const users = await User.countDocuments();
      userCount.set(users);
      console.log('METRICS: ✅ Updated user count:', users);
      
      // Update product count
      console.log('METRICS: Counting products in database...');
      const products = await Product.countDocuments();
      productCount.set(products);
      console.log('METRICS: ✅ Updated product count:', products);
      
      // Also update connection status
      dbConnectionStatus.set(1);
    } else {
      console.log('METRICS: ❌ Database not connected, readyState:', mongoose.connection.readyState);
      // Set default values if DB is not connected
      userCount.set(0);
      productCount.set(0);
      dbConnectionStatus.set(0);
    }
  } catch (error) {
    console.error('METRICS: ❌ Error updating collection counts:', error);
    // Set default values on error
    userCount.set(0);
    productCount.set(0);
    dbConnectionStatus.set(0);
  }
};

// Set up periodic updates every 30 seconds
let collectionCountInterval;

const startCollectionCountUpdates = () => {
  // Update immediately
  setTimeout(updateCollectionCounts, 2000); // Wait 2 seconds for DB connection
  
  // Then update every 30 seconds
  collectionCountInterval = setInterval(updateCollectionCounts, 30000);
  console.log('METRICS: Started collection count updates');
};

const forceUpdateCollectionCounts = async () => {
  console.log('METRICS: Force updating collection counts...');
  await updateCollectionCounts();
};

const stopCollectionCountUpdates = () => {
  if (collectionCountInterval) {
    clearInterval(collectionCountInterval);
    collectionCountInterval = null;
    console.log('METRICS: Stopped collection count updates');
  }
};

// Business metric functions
const incrementUserRegistrations = () => {
  console.log('METRICS: Incrementing user registrations');
  userRegistrations.inc();
  // Also update the total user count after a small delay
  setTimeout(updateCollectionCounts, 1000);
};

const incrementProductViews = () => {
  console.log('METRICS: Incrementing product views');
  productViews.inc();
};

const incrementOrders = (status = 'pending') => {
  console.log('METRICS: Incrementing orders with status:', status);
  ordersTotal.labels(status).inc();
};

const incrementCartOperations = (operation) => {
  console.log('METRICS: Incrementing cart operations with operation:', operation);
  cartOperations.labels(operation).inc();
};

module.exports = {
  register,
  metricsMiddleware,
  updateDbConnectionStatus,
  updateCollectionCounts,
  startCollectionCountUpdates,
  stopCollectionCountUpdates,
  forceUpdateCollectionCounts,
  incrementUserRegistrations,
  incrementProductViews,
  incrementOrders,
  incrementCartOperations
}; 