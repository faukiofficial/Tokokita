const router = require('express').Router();
const OrderController = require('../controllers/OrderController')
const authMiddleware = require('../middlewares/authMiddleware')
const path = require("path");
const multer = require("multer");

// Setup Multer for in-memory file storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const fileTypes = /jpeg|jpg|png|gif|svg|webp/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeType = fileTypes.test(file.mimetype);

    if (mimeType && extname) {
      return cb(null, true);
    } else {
      cb("Error: Images Only!");
    }
  },
});

router.post('/checkout', authMiddleware(['user']), OrderController.createOrder);
router.get('/all', authMiddleware(['admin']), OrderController.getAllOrders);
router.get('/user-orders', authMiddleware(['user', 'admin']), OrderController.getUserOrders);
router.post('/upload-payment-proof', authMiddleware(['user']), upload.single('paymentProof'), OrderController.uploadPaymentProof);
router.put('/update-status/:orderId', authMiddleware(['user','admin']), OrderController.updateOrderStatus);



// router.post('/complete-order', authMiddleware(['user', 'admin']), OrderController.addToCart);

module.exports = router;