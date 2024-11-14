const router = require('express').Router();
const CartController = require('../controllers/CartController')
const authMiddleware = require('../middlewares/authMiddleware')

// Get user's cart
router.get('/', authMiddleware(['user']), CartController.getCart);

// Add product to cart
router.post('/add', authMiddleware(['user']), CartController.addToCart);

// Remove product from cart
router.post('/remove', authMiddleware(['user']), CartController.removeFromCart);

// Update cart item quantity
router.post('/update', authMiddleware(['user']), CartController.updateCartItem);

// Clear cart
router.post('/clear', authMiddleware(['user']), CartController.clearCart);

module.exports = router;
