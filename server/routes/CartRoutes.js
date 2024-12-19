const router = require('express').Router();
const CartController = require('../controllers/CartController');
const checkAuth = require("../middlewares/checkAuth");
const checkRole = require("../middlewares/checkRole");

router.get('/', checkAuth, checkRole(['user']), CartController.getCart);

router.post('/add', checkAuth, checkRole(['user']), CartController.addToCart);

router.post('/remove', checkAuth, checkRole(['user']), CartController.removeFromCart);

router.post('/update', checkAuth, checkRole(['user']), CartController.updateCartItem);

router.post('/clear', checkAuth, checkRole(['user']), CartController.clearCart);

module.exports = router;
