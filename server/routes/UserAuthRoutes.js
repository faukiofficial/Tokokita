const router = require('express').Router();
const path = require('path');
const multer = require('multer');
const authController = require('../controllers/UserAuthController');
const authMiddleware = require('../middlewares/authMiddleware')

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

// Routes for user authentication
router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/logout', authController.logout)
router.delete('/delete-profile/:id', authMiddleware(['admin', 'user']), authController.deleteProfile)
router.put('/edit-profile/:id', upload.single('profilePicture'), authController.editProfile)
router.get('/check-auth', authMiddleware(), (req,res) => {
    const user = req.user
    res.status(200).json({
        success : true,
        message : 'Authenticated User',
        user
    })
})

module.exports = router;
