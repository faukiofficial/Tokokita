const router = require("express").Router();
const path = require("path");
const multer = require("multer");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProductById,
  deleteProduct,
} = require("../controllers/ProductController");
const authMiddleware = require("../middlewares/authMiddleware");

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

router.post(
  "/products",
  authMiddleware(['admin']),
  upload.array("images", 5),
  createProduct
);
router.get("/products", getProducts);
router.get("/products/:id", getProductById);
router.put(
  "/products/:id",
  authMiddleware(['admin']),
  upload.array("images", 5),
  updateProductById
);
router.delete("/products/:id", authMiddleware(['admin']), deleteProduct);

module.exports = router;
