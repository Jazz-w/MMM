require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./configuration/ConnectDB');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const orderRoutes = require('./routes/orderRoutes');
const path = require('path');
const { register, metricsMiddleware, updateDbConnectionStatus, startCollectionCountUpdates, forceUpdateCollectionCounts } = require('./middleware/metricsMiddleware');

// Check required environment variables
const requiredEnvVars = {
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('ERROR: Missing required environment variables:');
  missingVars.forEach(variable => console.error(`- ${variable}`));
  process.exit(1);
}

const app = express();

// CORS configuration based on environment
const corsOptions = {
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Request logging middleware with more detailed CORS logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    headers: req.headers,
    query: req.query,
    body: req.body,
    origin: req.headers.origin,
    host: req.headers.host
  });
  next();
});

// Middleware
app.use(express.json());

// Add metrics middleware
app.use(metricsMiddleware);

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Simple metrics update endpoint
app.get('/update-metrics', async (req, res) => {
  try {
    await forceUpdateCollectionCounts();
    res.json({ success: true, message: 'Collection counts updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Debug endpoint to manually update collection counts
app.get('/debug/update-metrics', async (req, res) => {
  try {
    await forceUpdateCollectionCounts();
    res.json({ success: true, message: 'Collection counts updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chatbot', require('./routes/chatbotRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Connect to MongoDB
connectDB();

// Start collection count updates after database connection
setTimeout(() => {
  if (mongoose.connection.readyState === 1) {
    startCollectionCountUpdates();
    // Force an immediate update
    setTimeout(() => {
      forceUpdateCollectionCounts();
    }, 3000);
  }
}, 2000); // Wait 2 seconds for database connection to be fully established

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});