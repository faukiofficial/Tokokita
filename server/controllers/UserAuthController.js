const bcrypts = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const { imageUploadUtil, deleteImageUtil } = require("../config/cloudinary");

// Registrasi User
exports.register = async (req, res) => {
  try {
    const { fullName, userName, email, phoneNumber, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { userName }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res
          .status(400)
          .json({ success: false, message: "Email already used." });
      } else if (existingUser.userName === userName) {
        return res
          .status(400)
          .json({ success: false, message: "Username already used." });
      }
    }

    const hashedPassword = await bcrypts.hash(password, 12);

    const newUser = new User({
      fullName,
      userName,
      email,
      phoneNumber,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(200).json({
      success: true,
      message: "Registrasr Successfully.",
      fullName,
      userName,
      email,
      phoneNumber,
      password,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Register Failed",
    });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const query = identifier.includes("@")
      ? { email: identifier }
      : { userName: identifier };

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ success: false, message: "Invalid user or password" });
    }

    const isMatch = await bcrypts.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid user or password" });
    }

    const token = jwt.sign(
      {
        userId: user._id
      },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    const refreshToken = jwt.sign(
      {
        userId: user._id
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    )

    res.cookie("token", token, {
      expires: new Date(Date.now() + 30 * 60 * 1000),
      maxAge: 30 * 60 * 1000,
      httpOnly: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    res.cookie("refreshToken", refreshToken, {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      maxAge: 30 * 24 * 30 * 60 * 1000,
      httpOnly: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    user.password = undefined;

    res.status(200).json({
      success: true,
      message: "Login Successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Login Failed" });
  }
};

// LOGOUT
exports.logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    res.clearCookie("refreshToken", {
      httpOnly: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Logout Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Logout Failed",
    });
  }
};

// Edit Profil User
exports.editProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { fullName, phoneNumber, email, userName } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan." });
    }

    if (req.file) {
      if (user.profilePicture && user.profilePicture.publicId) {
        await deleteImageUtil(user.profilePicture.publicId);
      }
      const uploadResult = await imageUploadUtil(req.file.buffer);
      user.profilePicture = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };
    }

    user.fullName = fullName || user.fullName;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.email = email || user.email;
    user.userName = userName || user.userName;

    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Profil berhasil diperbarui.", user });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan saat memperbarui profil.", error });
  }
};

// Hapus Akun User
exports.deleteProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan." });
    }

    if (user.profilePicture && user.profilePicture.publicId) {
      await deleteImageUtil(user.profilePicture.publicId);
    }

    await User.findByIdAndDelete(userId);

    res.clearCookie("token", {
      httpOnly: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    req.user = null;

    res.status(200).json({ success: true, message: "Akun berhasil dihapus." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan saat menghapus akun.", error });
  }
};

exports.getUserInfo = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      message: "Authenticated User",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({  success: false, message: "Unauthorized" });
  }
}
