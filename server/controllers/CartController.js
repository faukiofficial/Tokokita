const Cart = require("../models/CartModel");
const Product = require("../models/ProductModel");

// Add product to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id; // Assuming user ID is available in req.user
    console.log("User ID:", userId);

    // Find the cart for the user
    let cart = await Cart.findOne({ user: userId });

    // If no cart exists, create one
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if the product already exists in the cart
    const productIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (productIndex !== -1) {
      // If product exists, update the quantity
      cart.items[productIndex].quantity += quantity;
    } else {
      // If product doesn't exist, add it to the cart
      cart.items.push({ product: productId, quantity });
    }

    // Recalculate total price
    await recalculateTotalPrice(cart);

    // Save the cart
    await cart.save();

    res.status(200).json({ message: "Product added to cart", cart });
  } catch (error) {
    res.status(500).json({ message: "Error adding product to cart", error });
    console.log(error);
  }
};

// Remove product from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    // Find the cart for the user
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Remove the product from the cart
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    // Recalculate total price
    await recalculateTotalPrice(cart);

    // Save the cart
    await cart.save();

    res.status(200).json({ message: "Product removed from cart", cart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing product from cart", error });
  }
};

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("User ID cart:", userId);

    // Find the cart for the user
    const cart = await Cart.findOne({ user: userId }).populate("items.product")

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Sort the items array by updatedAt in descending order
    cart.items.sort((a, b) => new Date(b.updatedAt) - new Date(a.createdAt));

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart", error });
  }
};

// Update product quantity in cart
exports.updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    // Find the cart for the user
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the product in the cart and update its quantity
    const productIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    cart.items[productIndex].quantity = quantity;

    // Recalculate total price
    await recalculateTotalPrice(cart);

    // Save the cart
    await cart.save();

    res.status(200).json({ message: "Cart item updated", cart });
  } catch (error) {
    res.status(500).json({ message: "Error updating cart item", error });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the cart for the user
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Clear all items
    cart.items = [];

    // Reset total price
    cart.totalPrice = 0;

    // Save the cart
    await cart.save();

    res.status(200).json({ message: "Cart cleared", cart });
  } catch (error) {
    res.status(500).json({ message: "Error clearing cart", error });
  }
};

// Helper function to recalculate total price
const recalculateTotalPrice = async (cart) => {
    const populatedCart = await cart.populate('items.product'); // Mengambil produk terkait
  
    const totalPrice = populatedCart.items.reduce((acc, item) => {
      // Pastikan product.price dan item.quantity valid
      const price = item.product?.price || 0; // Default harga ke 0 jika tidak ada
      const quantity = item.quantity || 0; // Default quantity ke 0 jika tidak ada
      return acc + price * quantity;
    }, 0);
  
    cart.totalPrice = totalPrice;
  };
  
