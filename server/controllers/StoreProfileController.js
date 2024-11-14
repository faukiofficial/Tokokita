const StoreProfile = require("../models/StoreProfileModel");

// Create Store Profile
exports.createStoreProfile = async (req, res) => {
  try {
    // Cek apakah StoreProfile sudah ada
    const existingProfile = await StoreProfile.findOne();
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message:
          "Store profile sudah ada. Gunakan update untuk mengubah profil.",
      });
    }

    const { namaToko, nomorTelepon, email, alamat, mediaSosial } = req.body;

    console.log('req.body', req.body);

    // Parsing alamat jika dalam format string
    let parsedAlamat;
    try {
      parsedAlamat = typeof alamat === "string" ? JSON.parse(alamat) : alamat;
    } catch (parseError) {
      return res
        .status(400)
        .json({ success: false, message: "Format alamat tidak valid." });
    }

    // Validasi data alamat
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

    // Validasi keberadaan objek provinsi dan kota
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

    // Buat StoreProfile baru
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
      message: "Store profile berhasil dibuat.",
      storeProfile,
    });
  } catch (error) {
    console.error("Error di createStoreProfile controller:", error);
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat membuat profil toko.",
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
    res.status(200).json({ success: true, storeProfile });
  } catch (error) {
    console.error("Error di getStoreProfile controller:", error);
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

    console.log('req.body', req.body);

    // Update field lainnya
    storeProfile.namaToko = namaToko || storeProfile.namaToko;
    storeProfile.nomorTelepon = nomorTelepon || storeProfile.nomorTelepon;
    storeProfile.email = email || storeProfile.email;

    // Parsing dan Validasi alamat
    let parsedAlamat;
    if (alamat) {
      try {
        parsedAlamat = typeof alamat === "string" ? JSON.parse(alamat) : alamat;
      } catch (parseError) {
        return res
          .status(400)
          .json({ success: false, message: "Format alamat tidak valid." });
      }

      // Validasi data alamat
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

      // Validasi keberadaan objek provinsi dan kota
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

      // Update alamat jika valid
      storeProfile.alamat = {
        ...storeProfile.alamat,
        ...parsedAlamat,
      };
    }

    // Parsing dan Validasi media sosial
    if (mediaSosial) {
      // Pastikan mediaSosial adalah objek
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

    // Simpan perubahan
    await storeProfile.save();

    res.status(200).json({
      success: true,
      message: "Profil toko berhasil diperbarui.",
      storeProfile,
    });
  } catch (error) {
    console.error("Error di updateStoreProfile controller:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memperbarui profil toko.",
      error: error.message,
    });
  }
};
