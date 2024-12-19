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

  if (!items || !Array.isArray(items) || items.length === 0) {

    return res
      .status(400)
      .json({ success: false, message: "Items are required and should be a non-empty array." });
  }

  if (
    !quantities ||
    typeof quantities !== "object" ||
    Object.keys(quantities).length === 0
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Quantities are required and should be an object." });
  }

  if (!addressId) {
    return res.status(400).json({ success: false, message: "Address ID is required." });
  }

  if (totalPrice === undefined || typeof totalPrice !== "number") {
    return res
      .status(400)
      .json({ success: false, message: "Total price is required and should be a number." });
  }

  if (
    !shippingOption ||
    !shippingOption.service ||
    !shippingOption.description ||
    !shippingOption.cost
  ) {
    return res.status(400).json({ success: false, message: "Shipping option is required." });
  }

  try {
    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) {
      return res.status(400).json({ success: false, message: "Invalid address ID." });
    }

    const productIds = items.map((item) => item._id);

    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== items.length) {
      return res.status(400).json({ success: false, message: "Some products not found." });
    }

    const productMap = {};
    products.forEach((product) => {
      productMap[product._id.toString()] = product;
    });

    const orderItems = [];

    for (const item of items) {
      const productId = item._id.toString();

      if (!quantities[productId]) {
        return res.status(400).json({
          success: false,
          message: `Quantity for product ID ${productId} is missing.`,
        });
      }

      const quantity = quantities[productId];

      if (typeof quantity !== "number" || quantity <= 0) {
        return res
          .status(400)
          .json({ success: false, message: `Invalid quantity for product ID ${productId}.` });
      }

      if (productMap[productId].stock < quantity) {
        return res
          .status(400)
          .json({ success: false, message: `Insufficient stock for product ID ${productId}.` });
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
        service: shippingOption.service,
        description: shippingOption.description,
        cost: shippingOption.cost,
      },
      selectedShippingCode,
    });

    await newOrder.save();

    res
      .status(201)
      .json({ success: true, message: "Order created successfully", newOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating order" });
  }
};

exports.uploadPaymentProof = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user._id;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required." });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Payment proof image is required." });
    }

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    const result = await imageUploadUtil(req.file.buffer);

    order.paymentProof = result.secure_url;
    order.paymentStatus = "paid";

    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment proof uploaded successfully.",
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error uploading payment proof" });
  }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

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
      message: "Orders fetched successfully",
      orders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

// Get orders by userId
exports.getUserOrders = async (req, res) => {
  const userId = req.user._id;

  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    const totalUserOrders = await Order.countDocuments({ userId });

    const userOrders = await Order.find({ userId })
      .populate("items.product")
      .populate("addressId")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    if (!userOrders || userOrders.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No orders found for this user." });
    }

    res.status(200).json({
      success: true,
      message: "User orders fetched successfully",
      userOrders,
      totalUserOrders,
      totalPages: Math.ceil(totalUserOrders / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching user orders" });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { newStatus, trackingCode, products } = req.body;

    if (!newStatus) {
      return res.status(400).json({ success: false, message: "New status is required." });
    }

    const allowedStatuses = [
      "pending",
      "process",
      "ondelivery",
      "completed",
      "cancelled",
    ];
    if (!allowedStatuses.includes(newStatus)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    const currentStatus = order.status;
    const validTransitions = {
      pending: ["process", "cancelled"],
      process: ["ondelivery", "cancelled"],
      ondelivery: ["completed"],
      completed: [],
      cancelled: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from '${currentStatus}' to '${newStatus}'.`,
      });
    }

    if (newStatus === "ondelivery") {
      if (!trackingCode) {
        return res
          .status(400)
          .json({
            message:
              "Tracking code is required when changing status to 'ondelivery'.",
          });
      }
      order.trackingCode = trackingCode;
    }

    if (newStatus === "process" && products) {
      products.forEach(async (prod) => {
        const product = await Product.findById(prod.product._id);
        if (!product) {
          return res.status(404).json({ message: "Product not found." });
        }
        product.stock -= prod.quantity;
        product.sold += prod.quantity;

        await product.save();
      });
    }

    order.status = newStatus;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating order status" });
  }
};
