const Product = require("../models/ProductModel");
const { imageUploadUtil, deleteImageUtil } = require("../config/cloudinary"); // Sesuaikan dengan lokasi file cloudinaryUtils.js

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
        // Upload image to Cloudinary directly from memory
        const uploadResult = await imageUploadUtil(file.buffer);
        images.push(uploadResult.secure_url); // Save Cloudinary URL
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
    console.log("Error in createProduct controller:", error.message);
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

    // Validasi sortDirection
    const validSortDirections = [-1, 1];
    const direction = validSortDirections.includes(sortDirection) ? sortDirection : -1;

    // Query produk berdasarkan kategori dan pencarian
    const query = {};
    if (category) {
      query.category = category;
    }
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    // Ambil produk dengan sorting dan pagination
    const products = await Product.find(query)
      .sort({ [sortField]: direction })
      .skip((page - 1) * limit)
      .limit(limit);

    // Hitung total produk
    const totalProducts = await Product.countDocuments(query);

    res.json({
      products,
      totalProducts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Read One Product by Id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
      sold,
      weight,
      stock,
      category,
      tags,
      deletedImages,
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Hapus gambar yang dihapus oleh user dari Cloudinary
    if (deletedImages) {
      const imagesToDelete = JSON.parse(deletedImages);
      if (imagesToDelete.length > 0) {
        await Promise.all(
          imagesToDelete.map(async (image) => {
            const publicId = image.split("/").slice(-1)[0].split(".")[0];
            await deleteImageUtil(publicId); // Hapus dari Cloudinary
          })
        );

        // Hapus gambar dari database
        product.images = product.images.filter(
          (img) => !imagesToDelete.includes(img)
        );
      }
    }

    if (req.files) {
      for (const file of req.files) {
        // Upload new image to Cloudinary directly from memory
        const uploadResult = await imageUploadUtil(file.buffer);
        product.images.push(uploadResult.secure_url); // Save Cloudinary URL
      }
    }

    // Update other fields
    product.title = title;
    product.originalPrice = originalPrice;
    product.salePrice = salePrice;
    product.description = description;
    product.sold = sold;
    product.weight = weight;
    product.stock = stock;
    product.category = category;
    product.tags = tags ? tags.split(",") : [];

    await product.save();

    res
      .status(200)
      .json({ success: true, product, message: "Updated Succesfully" });
  } catch (error) {
    console.log("Error in updateProductById controller:", error.message);
    res.status(500).json({ success: false, message: "Update Failed" });
  }
};

// DELETE Product by Id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Delete images from Cloudinary
    if (product.images.length > 0) {
      await Promise.all(
        product.images.map(async (image) => {
          const publicId = image.split("/").slice(-1)[0].split(".")[0];
          await deleteImageUtil(publicId);
        })
      );
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
