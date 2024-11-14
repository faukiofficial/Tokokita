const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  namaPenerima: {
    type: String,
    required: true,
  },
  nomorTelepon: {
    type: String,
    required: true,
  },
  jalan: {
    type: String,
    required: true,
  },
  rtrw: {
    type: String
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
}, { timestamps: true });

// Middleware untuk memastikan konsistensi province_id antara kota dan provinsi
addressSchema.pre('save', async function(next) {
  try {
    if (this.kota.province_id !== this.provinsi.province_id) {
      throw new Error("province_id pada kota tidak cocok dengan province_id pada provinsi.");
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;
