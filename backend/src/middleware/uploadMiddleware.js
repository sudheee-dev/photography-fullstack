console.log("===== UPLOADMIDDLEWARE.JS LOADED =====");

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

console.log(
  "Cloudinary configured with cloud_name:",
  process.env.CLOUDINARY_CLOUD_NAME,
);

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "photography-app",
    resource_type: "auto",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

module.exports = upload;
