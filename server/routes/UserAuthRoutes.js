const router = require("express").Router();
const path = require("path");
const multer = require("multer");
const authController = require("../controllers/UserAuthController");
const checkAuth = require("../middlewares/checkAuth");
const checkRole = require("../middlewares/checkRole");

// Setup Multer untuk penyimpanan file dalam memori
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

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.delete(
  "/delete-profile/:id",
  checkAuth,
  checkRole(["admin", "user"]),
  authController.deleteProfile
);
router.put(
  "/edit-profile/:id",
  upload.single("profilePicture"),
  authController.editProfile
);
router.get("/check-auth", checkAuth, authController.getUserInfo);

module.exports = router;
