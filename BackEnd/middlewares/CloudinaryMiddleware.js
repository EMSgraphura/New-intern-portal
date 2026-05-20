import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/Cloudinary.js"

// Multer storage configuration for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith("video/");
    return {
      folder: "intern_feedback_media", // Folder name in Cloudinary
      resource_type: isVideo ? "video" : "image",
      public_id: file.originalname.split(".")[0], // optional
    };
  },
});

const upload = multer({ storage });

export default upload;