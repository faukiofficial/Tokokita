const router = require("express").Router();
const AddressController = require("../controllers/AdressController");
const authMiddleware = require("../middlewares/authMiddleware");

// Routes
router.post("/add", authMiddleware(["user", "admin"]), AddressController.createAddress);
router.get("/get", authMiddleware(["user", "admin"]), AddressController.getAllAddresses);
router.get("/get/:id", authMiddleware(["user", "admin"]), AddressController.getAddressById);
router.put("/edit/:id", authMiddleware(["user", "admin"]), AddressController.updateAddress);
router.delete("/delete/:id", authMiddleware(["user", "admin"]), AddressController.deleteAddress);

module.exports = router;
