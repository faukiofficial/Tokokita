const mongoose = require("mongoose");

const storeProfileSchema = new mongoose.Schema(
  {
    singleton: {
      type: String,
      default: "singleton",
      unique: true, // Memastikan hanya ada satu dokumen dengan nilai 'singleton'
      select: false, // Opsional: Menyembunyikan field ini saat query
    },
    namaToko: {
      type: String,
      required: true,
    },
    nomorTelepon: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      match: [/\S+@\S+\.\S+/, "Email tidak valid."],
    },
    alamat: {
      jalan: {
        type: String,
        required: true,
      },
      rtrw: {
        type: String,
      },
      kelurahan: {
        type: String,
        required: true,
      },
      kecamatan: {
        type: String,
        required: true,
      },
      kota: {
        city_id: {
          type: String,
          required: true,
        },
        city_name: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
        },
        postal_code: {
          type: String,
          required: true,
        },
        province: {
          type: String,
          required: true,
        },
        province_id: {
          type: String,
          required: true,
        },
      },
      provinsi: {
        province_id: {
          type: String,
          required: true,
        },
        province: {
          type: String,
          required: true,
        },
      },
    },
    mediaSosial: {
        instagram: {
          type: String,
          trim: true,
          default: ''
        },
        facebook: {
          type: String,
          trim: true,
          default: ''
        },
        whatsapp: {
          type: String,
          trim: true,
          default: ''
        },
        twitter: {
          type: String,
          trim: true,
          default: ''
        },
        tiktok: {
          type: String,
          trim: true,
          default: ''
        }
      }
  },
  { timestamps: true }
);

// Middleware untuk memastikan bahwa hanya ada satu profil toko
storeProfileSchema.pre("save", async function (next) {
  const StoreProfile = mongoose.model("StoreProfile", storeProfileSchema);
  const count = await StoreProfile.countDocuments();
  if (count >= 1 && !this._id) {
    return next(new Error("Hanya boleh ada satu profil toko."));
  }
  next();
});

// Middleware untuk memastikan province_id pada kota dan provinsi cocok
storeProfileSchema.pre("save", function (next) {
  if (this.alamat.kota.province_id !== this.alamat.provinsi.province_id) {
    return next(
      new Error(
        "province_id pada kota tidak cocok dengan province_id pada provinsi."
      )
    );
  }
  next();
});

const StoreProfile = mongoose.model("StoreProfile", storeProfileSchema);

module.exports = StoreProfile;
