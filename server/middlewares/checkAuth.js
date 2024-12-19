const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

const checkAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const refreshToken = req.cookies.refreshToken;

    if (!token && !refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    let user;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      user = await User.findById(decoded.userId).populate("addresses").select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }
    }

    if (!user && refreshToken) {
      const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_SECRET);

      user = await User.findById(decodedRefresh.userId).populate("addresses").select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const newToken = jwt.sign(
        {
          userId: user._id
        },
        process.env.JWT_SECRET,
        { expiresIn: "30m" }
      );

      res.cookie("token", newToken, {
        expires: new Date(Date.now() + 30 * 60 * 1000),
        maxAge: 30 * 60 * 1000,
        httpOnly: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
    }

    req.user = user;

    return next();
  } catch (error) {
    console.error("Authentication Error:", error);
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

module.exports = checkAuth;