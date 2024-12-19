const Address = require("../models/AddressModel");
const User = require("../models/UserModel")

// Create Address
exports.createAddress = async (req, res) => {
  try {
    const {
      namaPenerima,
      nomorTelepon,
      jalan,
      rtrw,
      kelurahan,
      kecamatan,
      kota,
      provinsi,
    } = req.body;

    if (!provinsi || !provinsi.province_id || !provinsi.province) {
      return res
        .status(400)
        .json({ success: false, message: "Provinsi tidak lengkap." });
    }

    if (
      !kota ||
      !kota.city_id ||
      !kota.city_name ||
      !kota.type ||
      !kota.postal_code
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Kota tidak lengkap." });
    }

    const address = new Address({
      user: req.user.id,
      namaPenerima,
      nomorTelepon,
      jalan,
      rtrw,
      kelurahan,
      kecamatan,
      kota,
      provinsi,
    });

    await address.save();

    req.user.addresses.push(address._id);
    await req.user.save();

    res.status(201).json({ success: true, address, message: "Address created" });
  } catch (error) {
    res.status(400).json({ success: false, message: "Error creating address" });
  }
};

// Get All Addresses
exports.getAllAddresses = async (req, res) => {
  try {
    const addressList = await Address.find({ user: req.user.id });
    res.status(200).json({ success: true, addressList });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching addresses" });
  }
};

// Get Address by ID
exports.getAddressById = async (req, res) => {
  try {
    const address = await Address.findById({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }
    res.status(200).json({ success: true, address, message: "Address found" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching address" });
  }
};

// Update Address
exports.updateAddress = async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = [
      "namaPenerima",
      "nomorTelepon",
      "jalan",
      "rtrw",
      "kelurahan",
      "kecamatan",
      "kota",
      "provinsi",
      "kodePos",
    ];
    const isValidOperation = Object.keys(updates).every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid updates!" });
    }

    // Cari alamat yang dimiliki oleh pengguna
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    // Update fields yang diizinkan
    allowedUpdates.forEach((update) => {
      if (updates[update] !== undefined) {
        address[update] = updates[update];
      }
    });

    await address.save();

    res.status(200).json({ success: true, address, message: "Address updated" });
  } catch (error) {
    res.status(400).json({ success: false, message: "Error updating address" });
  }
};

// Delete Address
exports.deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const userId = req.user.id;

    const address = await Address.findOneAndDelete({
      _id: addressId,
      user: userId,
    });

    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    console.log("Address found, removing from user...");

    const updateUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { addresses: addressId } },
      { new: true }
    ).populate("addresses");

    if (!updateUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting address" });
  }
};
