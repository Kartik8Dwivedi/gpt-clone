import { v2 as cloudinary } from 'cloudinary';
import AppConfig from '../config'; // Import the centralized config
import logger from '../logger'; // Import the logger

if (!AppConfig.CLOUDINARY_CLOUD_NAME || !AppConfig.CLOUDINARY_API_KEY || !AppConfig.CLOUDINARY_API_SECRET) {
  logger.error("Cloudinary credentials are not fully set in AppConfig.");
  // Depending on strictness, you might throw an error here or just log a warning.
  // For now, we'll proceed but log the error.
}

cloudinary.config({
  cloud_name: AppConfig.CLOUDINARY_CLOUD_NAME,
  api_key: AppConfig.CLOUDINARY_API_KEY,
  api_secret: AppConfig.CLOUDINARY_API_SECRET,
});

export default cloudinary;
