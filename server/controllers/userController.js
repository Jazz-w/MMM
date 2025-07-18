const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      provider: 'local'
    });

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isAdmin: user.isAdmin
      },
      token: generateToken(user._id, user.isAdmin)
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    console.log('Login attempt with body:', req.body);
    const { email, password } = req.body;

    // Log the query we're about to make
    console.log('Searching for user with email:', email);

    // First, let's check all users in the collection
    const allUsers = await User.find({});
    console.log('All users in database:', allUsers.map(u => ({
      email: u.email,
      isAdmin: u.isAdmin,
      provider: u.provider
    })));

    // Use case-insensitive email lookup
    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    console.log('User search result:', user ? {
      id: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
      provider: user.provider,
      hasPassword: !!user.password
    } : 'no user found');
    
    if (!user) {
      console.log('Login failed: User not found');
      return res.status(401).json({ 
        success: false, 
        error: "Invalid email or password" 
      });
    }

    console.log('Attempting password match...');
    console.log('Stored password hash:', user.password);
    console.log('Provider:', user.provider);
    
    const isPasswordValid = await user.matchPassword(password);
    console.log('Password validation result:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('Login failed: Invalid password');
      return res.status(401).json({ 
        success: false, 
        error: "Invalid email or password" 
      });
    }

    // Generate token with userId
    const token = generateToken(user._id, user.isAdmin);
    console.log('Generated token for user:', {
      userId: user._id,
      isAdmin: user.isAdmin,
      tokenLength: token.length
    });

    const response = {
      success: true,
      token: token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isAdmin: user.isAdmin,
        profilePicture: user.profilePicture
      }
    };
    console.log('Sending successful response:', { 
      success: response.success,
      hasToken: !!response.token,
      user: { 
        email: response.user.email,
        isAdmin: response.user.isAdmin 
      }
    });

    res.json(response);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ 
      success: false, 
      error: "An error occurred while processing your request" 
    });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const updates = req.body;

    // Update basic fields
    if (updates.firstName) user.firstName = updates.firstName;
    if (updates.lastName) user.lastName = updates.lastName;
    if (updates.email) user.email = updates.email;
    if (updates.password) user.password = updates.password;
    if (updates.phoneNumber) user.phoneNumber = updates.phoneNumber;
    if (updates.profilePicture) user.profilePicture = updates.profilePicture;

    // Save the updated user
    const updatedUser = await user.save();

    res.json({
      success: true,
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        role: updatedUser.role,
        isAdmin: updatedUser.isAdmin,
        profilePicture: updatedUser.profilePicture
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isAdmin: user.isAdmin,
        profilePicture: user.profilePicture,
        addresses: user.addresses,
        cart: user.cart,
        wishlist: user.wishlist
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    
    // Check if user exists
    let user = await User.findOne({ email: payload.email });
    
    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        firstName: payload.given_name || '',
        lastName: payload.family_name || '',
        email: payload.email,
        password: Math.random().toString(36).slice(-8), // Generate random password
        phoneNumber: '', // You might want to ask for this later
        provider: 'google',
        providerId: payload.sub,
        profilePicture: payload.picture || '',
        isActive: true
      });
      
      // Track user registration metric for Google signup
      incrementUserRegistrations();
    }

    // Generate token and send response
    res.json({
      success: true,
      token: generateToken(user._id, user.isAdmin),
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isAdmin: user.isAdmin,
        profilePicture: user.profilePicture
      }
    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(401).json({ success: false, error: "Invalid Google token" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateUserProfile,
  getUserProfile,
  googleLogin
};