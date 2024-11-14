const Order = require("../models/OrderModel");
const Product = require("../models/ProductModel");
const Address = require("../models/AddressModel"); // Pastikan model Address diimpor
const { imageUploadUtil } = require("../config/cloudinary");

// Create an Order (Checkout)
exports.createOrder = async (req, res) => {
  const userId = req.user._id;
  const {
    items,
    quantities,
    shippingCost,
    addressId,
    totalPrice,
    shippingOption,
    selectedShippingCode,
  } = req.body;

  // Validasi input
  if (!items || !Array.isArray(items) || items.length === 0) {
    console.log("Items are required and should be a non-empty array.");

    return res
      .status(400)
      .json({ message: "Items are required and should be a non-empty array." });
  }

  if (
    !quantities ||
    typeof quantities !== "object" ||
    Object.keys(quantities).length === 0
  ) {
    console.log("Quantities are required and should be an object.");
    return res
      .status(400)
      .json({ message: "Quantities are required and should be an object." });
  }

  if (!addressId) {
    console.log("Address ID is required.");
    return res.status(400).json({ message: "Address ID is required." });
  }

  if (totalPrice === undefined || typeof totalPrice !== "number") {
    console.log("Total price is required and should be a number.");
    return res
      .status(400)
      .json({ message: "Total price is required and should be a number." });
  }

  // Validasi shippingOption
  if (
    !shippingOption ||
    !shippingOption.service ||
    !shippingOption.description ||
    !shippingOption.cost
  ) {
    console.log("Shipping option is required.");
    return res.status(400).json({ message: "Shipping option is required." });
  }

  try {
    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) {
      console.log("Invalid address ID.");
      return res.status(400).json({ message: "Invalid address ID." });
    }

    const productIds = items.map((item) => item._id);

    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== items.length) {
      console.log("Some products not found.");
      return res.status(400).json({ message: "Some products not found." });
    }

    const productMap = {};
    products.forEach((product) => {
      productMap[product._id.toString()] = product;
    });

    const orderItems = [];

    for (const item of items) {
      const productId = item._id.toString();

      if (!quantities[productId]) {
        console.log(`Quantity for product ID ${productId} is missing.`);
        return res.status(400).json({
          message: `Quantity for product ID ${productId} is missing.`,
        });
      }

      const quantity = quantities[productId];

      if (typeof quantity !== "number" || quantity <= 0) {
        console.log(`Invalid quantity for product ID ${productId}.`);
        return res
          .status(400)
          .json({ message: `Invalid quantity for product ID ${productId}.` });
      }

      if (productMap[productId].stock < quantity) {
        console.log(`Insufficient stock for product ID ${productId}.`);
        return res
          .status(400)
          .json({ message: `Insufficient stock for product ID ${productId}.` });
      }

      orderItems.push({
        product: productMap[productId]._id,
        quantity: quantity,
      });
    }

    const newOrder = new Order({
      userId,
      addressId,
      items: orderItems,
      totalPrice,
      shippingCost: shippingCost || 0,
      shippingOption: {
        // Menyimpan informasi pengiriman
        service: shippingOption.service,
        description: shippingOption.description,
        cost: shippingOption.cost,
      },
      selectedShippingCode,
    });

    await newOrder.save();

    console.log("Order created successfully:", newOrder);

    res
      .status(201)
      .json({ success: true, message: "Order created successfully", newOrder });
  } catch (error) {
    console.error("Error in createOrder controller:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadPaymentProof = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user._id;

    // Validasi input
    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required." });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Payment proof image is required." });
    }

    // Cari order berdasarkan orderId dan userId untuk keamanan
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Upload gambar ke Cloudinary
    const result = await imageUploadUtil(req.file.buffer);

    // Perbarui order dengan URL gambar bukti pembayaran
    order.paymentProof = result.secure_url;
    order.paymentStatus = "paid"; // Update status pembayaran jika diperlukan

    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment proof uploaded successfully.",
      order,
    });
  } catch (error) {
    console.error("Error in uploadPaymentProof controller:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    // Hitung jumlah total pesanan
    const totalOrders = await Order.countDocuments();

    const orders = await Order.find()
      .populate("items.product")
      .populate("addressId")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No orders found." });
    }

    res.status(200).json({
      success: true,
      orders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error in getAllOrders controller:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get orders by userId
exports.getUserOrders = async (req, res) => {
  const userId = req.user._id;

  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    // Hitung jumlah total pesanan untuk user ini
    const totalUserOrders = await Order.countDocuments({ userId });

    const userOrders = await Order.find({ userId })
      .populate("items.product")
      .populate("addressId")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    console.log(`Fetched orders for user ID ${userId}:`, userOrders);

    if (!userOrders || userOrders.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No orders found for this user." });
    }

    res
      .status(200)
      .json({
        success: true,
        userOrders,
        totalUserOrders,
        totalPages: Math.ceil(totalUserOrders / limit),
        currentPage: page,
      });
  } catch (error) {
    console.error("Error in getUserOrders controller:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { newStatus, trackingCode } = req.body;

    // Validasi input
    if (!newStatus) {
      return res.status(400).json({ message: "New status is required." });
    }

    const allowedStatuses = ['pending', 'process', 'ondelivery', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(newStatus)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    // Cari order berdasarkan orderId
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Validasi Transisi Status
    const currentStatus = order.status;
    const validTransitions = {
      'pending': ['process', 'cancelled'],
      'process': ['ondelivery', 'cancelled'],
      'ondelivery': ['completed'],
      'completed': [],
      'cancelled': []
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      return res.status(400).json({
        message: `Cannot change status from '${currentStatus}' to '${newStatus}'.`
      });
    }

    // Jika status baru adalah 'ondelivery', pastikan trackingCode diberikan
    if (newStatus === 'ondelivery') {
      if (!trackingCode) {
        return res.status(400).json({ message: "Tracking code is required when changing status to 'ondelivery'." });
      }
      order.trackingCode = trackingCode;
    }

    // Update status
    order.status = newStatus;

    // (Opsional) Tambahkan Log atau Tanggal Waktu Perubahan Status
    // Misalnya: order.statusUpdatedAt = new Date();

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      order
    });
  } catch (error) {
    console.error("Error in updateOrderStatus controller:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};