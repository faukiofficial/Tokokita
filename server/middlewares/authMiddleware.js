const jwt = require("jsonwebtoken");
const User = require("../models/UserModel"); // Sesuaikan path sesuai struktur proyek Anda

const authMiddleware = (requiredRoles = []) => {
  return async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).populate('addresses');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: User not found",
        });
      }

      // Cek peran jika diperlukan
      if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Insufficient permissions",
        });
      }
      
      req.user = user;

      next(); // Lanjutkan ke rute berikutnya
    } catch (error) {
      console.error("Authentication Error:", error);
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid token",
      });
    }
  };
};

module.exports = authMiddleware;
