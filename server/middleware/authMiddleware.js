const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader ? 'present' : 'missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized, no token or invalid format',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token received:', token.substring(0, 20) + '...');
    
    try {
      console.log('Attempting to verify token with secret length:', process.env.JWT_SECRET?.length || 0);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Log the decoded token for debugging
      console.log('Decoded token:', decoded);
      
      // Check if token has required fields
      if (!decoded || typeof decoded !== 'object') {
        console.log('Token decode failed - invalid format');
        return res.status(401).json({
          success: false,
          error: 'Invalid token format',
          code: 'INVALID_TOKEN'
        });
      }

      // Support both id and userId fields for backward compatibility
      const userId = decoded.userId || decoded.id;
      if (!userId) {
        console.log('Token missing user ID');
        return res.status(401).json({
          success: false,
          error: 'Invalid token format: no user ID',
          code: 'INVALID_TOKEN'
        });
      }

      console.log('Looking up user:', userId);
      const user = await User.findById(userId)
        .select('-password');

      if (!user) {
        console.log('User not found:', userId);
        return res.status(401).json({
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      console.log('User found:', user._id);

      // Attach the full user object to the request
      req.user = user;
      next();
    } catch (error) {
      console.error('Token verification error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token',
          code: 'INVALID_TOKEN'
        });
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Auth middleware error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      error: 'Server error in authentication',
      code: 'SERVER_ERROR'
    });
  }
};

const admin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ 
      success: false, 
      error: 'Not authorized as an admin' 
    });
  }
  next();
};

module.exports = { protect, admin };