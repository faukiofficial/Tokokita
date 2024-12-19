const router = require("express").Router();
const rajaongkirController = require("../controllers/RajaongkirController");

router.post("/get-shipping-cost", rajaongkirController.getShippingCostController);
router.get("/provinces", rajaongkirController.getProvinces);
router.get("/cities", rajaongkirController.getCities);

module.exports = router;