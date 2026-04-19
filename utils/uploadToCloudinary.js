const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = async (base64Image) => {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "moska_products",
    });

    return {
      url: result.secure_url,
      imageName: result.original_filename,
      public_id: result.public_id,
    };
  } catch (error) {
    throw new Error("Cloudinary upload failed");
  }
};

module.exports = uploadToCloudinary;