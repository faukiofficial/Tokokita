const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

// Define the user schema
const userSchema = new Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  userName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  profilePicture: {
    url: { type: String },
    publicId: { type: String },
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  addresses: [{
    type: Schema.Types.ObjectId,
    ref: 'Address'
  }],
  orders: [{
    type: Schema.Types.ObjectId,
    ref: 'Order'
  }],
  cart: {
    type: Schema.Types.ObjectId,
    ref: 'Cart'
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;
