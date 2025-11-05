const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

/**
 * Upload buffer (file tạm trong RAM) lên Cloudinary.
 * @param {Buffer} buffer - file.buffer từ multer
 * @param {String} resourceType - loại dữ liệu ('image', 'video', 'raw', 'auto', 'audio')
 * @returns {Promise<String>} - Trả về URL của file trên Cloudinary
 */
const uploadToCloudinaryBuffer = async (buffer, resourceType = "auto") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

module.exports = { uploadToCloudinaryBuffer };
