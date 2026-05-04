const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: String,
    required: true
  },
  updatedAt: {
    type: String,
    required: true
  },
  status: {
    type: Boolean,
    default: true
  },
  refreshToken: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('User', userSchema);