const Product = require("../models/ProductModel");
const { imageUploadUtil, deleteImageUtil } = require("../config/cloudinary");

// CREATE New Product
exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      originalPrice,
      salePrice,
      description,
      weight,
      stock,
      category,
      tags,
    } = req.body;

    let images = [];
    if (req.files) {
      for (const file of req.files) {
        const uploadResult = await imageUploadUtil(file.buffer);
        images.push(uploadResult.secure_url);
      }
    }

    const product = new Product({
      title,
      originalPrice,
      salePrice,
      description,
      weight,
      stock,
      category,
      tags: tags ? tags.split(",") : [],
      images,
    });

    await product.save();
    res
      .status(201)
      .json({ success: true, product, message: "Uploaded Succesfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Upload Failed" });
  }
};

// Read All Products with Pagination
exports.getProducts = async (req, res) => {
  try {
    const category = req.query.category;
    const search = req.query.search;
    const sortField = req.query.sortField || "createdAt";
    const sortDirection = parseInt(req.query.sortDirection) || -1;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    const validSortDirections = [-1, 1];
    const direction = validSortDirections.includes(sortDirection)
      ? sortDirection
      : -1;

    const query = {};
    if (category) {
      query.category = category;
    }
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const products = await Product.find(query)
      .sort({ [sortField]: direction })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalProducts = await Product.countDocuments(query);

    res.json({
      success: true,
      message: "Products fetched successfully",
      products,
      totalProducts,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch products" });
  }
};

// Read One Product by Id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.json({
      success: true,
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch product" });
  }
};

// UPDATE Product by Id
exports.updateProductById = async (req, res) => {
  try {
    const {
      title,
      originalPrice,
      salePrice,
      description,
      weight,
      stock,
      category,
      tags,
      deletedImages,
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    if (deletedImages) {
      const imagesToDelete = JSON.parse(deletedImages);
      if (imagesToDelete.length > 0) {
        await Promise.all(
          imagesToDelete.map(async (image) => {
            const publicId = image.split("/").slice(-1)[0].split(".")[0];
            await deleteImageUtil(publicId);
          })
        );

        product.images = product.images.filter(
          (img) => !imagesToDelete.includes(img)
        );
      }
    }

    if (req.files) {
      for (const file of req.files) {
        const uploadResult = await imageUploadUtil(file.buffer);
        product.images.push(uploadResult.secure_url);
      }
    }

    product.title = title;
    product.originalPrice = originalPrice;
    product.salePrice = salePrice;
    product.description = description;
    product.weight = weight;
    product.stock = stock;
    product.category = category;
    product.tags = tags ? tags.split(",") : [];

    await product.save();

    res
      .status(200)
      .json({ success: true, product, message: "Updated Succesfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update Failed" });
  }
};

// DELETE Product by Id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    if (product.images.length > 0) {
      await Promise.all(
        product.images.map(async (image) => {
          const publicId = image.split("/").slice(-1)[0].split(".")[0];
          await deleteImageUtil(publicId);
        })
      );
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to delete product" });
  }
};
