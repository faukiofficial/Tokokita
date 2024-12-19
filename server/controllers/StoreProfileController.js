const StoreProfile = require("../models/StoreProfileModel");

// Create Store Profile
exports.createStoreProfile = async (req, res) => {
  try {
    const existingProfile = await StoreProfile.findOne();
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "Store profile already exists.",
      });
    }

    const { namaToko, nomorTelepon, email, alamat, mediaSosial } = req.body;

    let parsedAlamat;
    try {
      parsedAlamat = typeof alamat === "string" ? JSON.parse(alamat) : alamat;
    } catch (parseError) {
      return res
        .status(400)
        .json({ success: false, message: "Address format is invalid." });
    }

    if (
      !parsedAlamat ||
      !parsedAlamat.jalan ||
      !parsedAlamat.kelurahan ||
      !parsedAlamat.kecamatan ||
      !parsedAlamat.kota ||
      !parsedAlamat.provinsi
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Address is incomplete." });
    }

    if (
      !parsedAlamat.provinsi ||
      !parsedAlamat.provinsi.province_id ||
      !parsedAlamat.provinsi.province
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Province not complete." });
    }

    if (
      !parsedAlamat.kota ||
      !parsedAlamat.kota.city_id ||
      !parsedAlamat.kota.city_name ||
      !parsedAlamat.kota.type ||
      !parsedAlamat.kota.postal_code
    ) {
      return res
        .status(400)
        .json({ success: false, message: "City not complete." });
    }

    const storeProfile = new StoreProfile({
      namaToko,
      nomorTelepon,
      email,
      alamat: parsedAlamat,
      mediaSosial: mediaSosial || {},
    });

    await storeProfile.save();

    res.status(201).json({
      success: true,
      message: "Store profile created successfully.",
      storeProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create store profile.",
      error: error.message,
    });
  }
};

// Get Store Profile
exports.getStoreProfile = async (req, res) => {
  try {
    const storeProfile = await StoreProfile.findOne();
    if (!storeProfile) {
      return res.status(404).json({
        success: false,
        message: "Anda belum menambahkan data store profile.",
      });
    }
    res.status(200).json({ success: true, message: "Berhasil mengambil profil toko.", storeProfile });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil profil toko.",
      error: error.message,
    });
  }
};

// Update Store Profile
exports.updateStoreProfile = async (req, res) => {
  try {
    const storeProfile = await StoreProfile.findOne();
    if (!storeProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Store profile tidak ditemukan." });
    }

    const { namaToko, nomorTelepon, email, alamat, mediaSosial } = req.body;

    storeProfile.namaToko = namaToko || storeProfile.namaToko;
    storeProfile.nomorTelepon = nomorTelepon || storeProfile.nomorTelepon;
    storeProfile.email = email || storeProfile.email;

    let parsedAlamat;
    if (alamat) {
      try {
        parsedAlamat = typeof alamat === "string" ? JSON.parse(alamat) : alamat;
      } catch (parseError) {
        return res
          .status(400)
          .json({ success: false, message: "Format alamat tidak valid." });
      }

      if (
        !parsedAlamat ||
        !parsedAlamat.jalan ||
        !parsedAlamat.kelurahan ||
        !parsedAlamat.kecamatan ||
        !parsedAlamat.kota ||
        !parsedAlamat.provinsi
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Data alamat tidak lengkap." });
      }

      if (
        !parsedAlamat.provinsi ||
        !parsedAlamat.provinsi.province_id ||
        !parsedAlamat.provinsi.province
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Provinsi tidak lengkap." });
      }

      if (
        !parsedAlamat.kota ||
        !parsedAlamat.kota.city_id ||
        !parsedAlamat.kota.city_name ||
        !parsedAlamat.kota.type ||
        !parsedAlamat.kota.postal_code
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Kota tidak lengkap." });
      }

      storeProfile.alamat = {
        ...storeProfile.alamat,
        ...parsedAlamat,
      };
    }

    // Parsing dan Validasi media sosial
    if (mediaSosial) {
      if (typeof mediaSosial !== "object") {
        return res.status(400).json({
          success: false,
          message: "Format media sosial tidak valid.",
        });
      }
      storeProfile.mediaSosial = {
        ...storeProfile.mediaSosial,
        ...mediaSosial,
      };
    }

    await storeProfile.save();

    res.status(200).json({
      success: true,
      message: "Profil toko berhasil diperbarui.",
      storeProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memperbarui profil toko.",
      error: error.message,
    });
  }
};
