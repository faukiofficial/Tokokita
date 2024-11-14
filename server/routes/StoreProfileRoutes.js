const router = require('express').Router();
const StoreProfileController = require('../controllers/StoreProfileController');
const authMiddleware = require('../middlewares/authMiddleware');

// Routes for store data management
router.post('/add', authMiddleware(['admin']), StoreProfileController.createStoreProfile);
router.get('/get', StoreProfileController.getStoreProfile);
router.put('/update', authMiddleware(['admin']), StoreProfileController.updateStoreProfile);

module.exports = router;