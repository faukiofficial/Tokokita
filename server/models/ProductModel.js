const mongoose = require('mongoose');

// Define the product schema
const productSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true // Remove any leading or trailing whitespace
  },
  description: { 
    type: String,
    trim: true // Remove any leading or trailing whitespace
  },
  category: { 
    type: String, 
    required: true,
    trim: true // Remove any leading or trailing whitespace
  },
  tags: [{ 
    type: String,
    trim: true,
    required: true
  }],
  originalPrice: { 
    type: Number,
    min: 0,
  },
  salePrice: { 
    type: Number,
    min: 0,
    required: true
  },
  sold: { 
    type: Number,
    min: 0,
    default: 0
  },
  weight: { 
    type: Number, 
    required: true, // Set to true if weight is mandatory
    min: 0 // Weight cannot be negative
  },
  stock: { 
    type: Number, 
    required: true,
    min: 0
  },
  images: [{ 
    type: String,
    trim: true,
    required: true
  }],
}, {
  timestamps: true 
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
