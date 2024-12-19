const router = require('express').Router();
const OrderController = require('../controllers/OrderController')
const path = require("path");
const multer = require("multer");
const checkAuth = require("../middlewares/checkAuth");
const checkRole = require("../middlewares/checkRole");

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

router.post('/checkout', checkAuth, checkRole(['user']), OrderController.createOrder);
router.get('/all', checkAuth, checkRole(['admin']), OrderController.getAllOrders);
router.get('/user-orders', checkAuth, checkRole(['user', 'admin']), OrderController.getUserOrders);
router.post('/upload-payment-proof', checkAuth, checkRole(['user']), upload.single('paymentProof'), OrderController.uploadPaymentProof);
router.put('/update-status/:orderId', checkAuth, checkRole(['user','admin']), OrderController.updateOrderStatus);

module.exports = router;