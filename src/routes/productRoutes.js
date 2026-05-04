const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const authenticateToken = require('../middleware/authMiddleware');

// GET /api/products - Get all products (Private - requires token)
router.get('/products', authenticateToken, async (req, res) => {
  try {
    const products = await Product.find().select('-__v');
    
    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: products
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// GET /api/products/:id - Get a single product by ID (Private - requires token)
router.get('/products/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).select('-__v');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      data: product
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// POST /api/products - Create a new product (Private - requires token)
router.post('/products', authenticateToken, async (req, res) => {
  try {
    const { product_name, price, description } = req.body;

    // Validate required fields
    if (!product_name || !price) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide product_name and price' 
      });
    }

    // Create new product
    const newProduct = new Product({
      product_name,
      price,
      description: description || ''
    });

    // Save product to database
    const savedProduct = await newProduct.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: savedProduct
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// PUT /api/products/:id - Update a product by ID (Private - requires token)
router.put('/products/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { product_name, price, description } = req.body;

    // Validate required fields
    if (!product_name || !price) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide product_name and price' 
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { product_name, price, description: description || '' },
      { returnDocument: 'after', runValidators: true }
    ).select('-__v');

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// DELETE /api/products/:id - Delete a product by ID (Private - requires token)
router.delete('/products/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router;