const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Token configuration
const ACCESS_TOKEN_EXPIRY = '15m';  // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d';  // 7 days

// POST /api/register - Register a new user
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    // Validate required fields
    if (!full_name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide full_name, email, and password' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email already exists' 
      });
    }

    // Get current date and time
    const now = new Date();
    const formattedDate = formatDate(now);

    // Create new user
    const newUser = new User({
      full_name,
      email,
      password,
      createdAt: formattedDate,
      updatedAt: formattedDate,
      status: true
    });

    // Save user to database
    const savedUser = await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: savedUser
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// POST /api/login - Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email and password' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Check password (simple comparison - in production use bcrypt)
    if (user.password !== password) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Check if user is active
    if (!user.status) {
      return res.status(403).json({ 
        success: false,
        message: 'Account is disabled' 
      });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();

    // Prepare user data (exclude password and refreshToken)
    const userData = {
      _id: user._id,
      full_name: user.full_name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      status: user.status
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        accessToken: accessToken,
        refreshToken: refreshToken
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// Helper function to format date as DD-MM-YYYY HH:mm:ss
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

module.exports = router;