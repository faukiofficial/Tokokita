const router = require("express").Router();
const AddressController = require("../controllers/AdressController");
const checkAuth = require("../middlewares/checkAuth");
const checkRole = require("../middlewares/checkRole");

// Routes
router.post("/add", checkAuth, checkRole(["user", "admin"]), AddressController.createAddress);
router.get("/get", checkAuth, checkRole(["user", "admin"]), AddressController.getAllAddresses);
router.get("/get/:id", checkAuth, checkRole(["user", "admin"]), AddressController.getAddressById);
router.put("/edit/:id", checkAuth, checkRole(["user", "admin"]), AddressController.updateAddress);
router.delete("/delete/:id", checkAuth, checkRole(["user", "admin"]), AddressController.deleteAddress);

module.exports = router;
