const router = require('express').Router();
const StoreProfileController = require('../controllers/StoreProfileController');
const checkAuth = require("../middlewares/checkAuth");
const checkRole = require("../middlewares/checkRole");

router.post('/add', checkAuth, checkRole(['admin']), StoreProfileController.createStoreProfile);
router.get('/get', StoreProfileController.getStoreProfile);
router.put('/update', checkAuth, checkRole(['admin']), StoreProfileController.updateStoreProfile);

module.exports = router;