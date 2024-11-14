const mongoose = require('mongoose');

// Definisikan schema untuk item di cart
const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId, // Mengacu ke produk
    ref: 'Product', // Nama model produk
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1, // Default jumlah adalah 1
  },
}, {timestamps: true});

// Definisikan schema untuk cart
const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, // Mengacu ke user
    ref: 'User', // Nama model user
    required: true,
  },
  items: [cartItemSchema], // Array dari produk yang ada di keranjang
  totalPrice: {
    type: Number,
    required: true,
    default: 0, // Total harga bisa dihitung secara otomatis
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {timestamps: true});

// Buat model untuk Cart
const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
