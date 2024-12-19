const Cart = require("../models/CartModel");
const Product = require("../models/ProductModel");

// Add product to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const productIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (productIndex !== -1) {
      cart.items[productIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await recalculateTotalPrice(cart);

    await cart.save();

    res
      .status(200)
      .json({ success: true, message: "Product added to cart", cart });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error adding product to cart" });
  }
};

// Remove product from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await recalculateTotalPrice(cart);

    await cart.save();

    res
      .status(200)
      .json({ success: true, message: "Product removed from cart", cart });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error removing product from cart",
        error,
      });
  }
};

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items.sort((a, b) => new Date(b.updatedAt) - new Date(a.createdAt));

    res.status(200).json({success: true, message: "Cart found", cart});
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching cart", error });
  }
};

// Update product quantity in cart
exports.updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const productIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    cart.items[productIndex].quantity = quantity;

    await recalculateTotalPrice(cart);

    await cart.save();

    res.status(200).json({ success: true, message: "Cart item updated", cart });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating cart item", error });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];

    cart.totalPrice = 0;

    await cart.save();

    res.status(200).json({ success: true, message: "Cart cleared", cart });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error clearing cart", error });
  }
};

// Helper function to recalculate total price
const recalculateTotalPrice = async (cart) => {
  const populatedCart = await cart.populate("items.product");

  const totalPrice = populatedCart.items.reduce((acc, item) => {
    const price = item.product?.price || 0;
    const quantity = item.quantity || 0;
    return acc + price * quantity;
  }, 0);

  cart.totalPrice = totalPrice;
};
