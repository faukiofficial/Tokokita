const cloudinary = require("cloudinary").v2; // Pastikan menggunakan v2
const multer = require("multer");
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();

const imageUploadUtil = async (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { resource_type: 'auto' },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    ).end(buffer); // Use .end() to upload the buffer
  });
};

const deleteImageUtil = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image'
    });
    return result;
  } catch (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

const upload = multer({ storage });

module.exports = { upload, imageUploadUtil, deleteImageUtil };
