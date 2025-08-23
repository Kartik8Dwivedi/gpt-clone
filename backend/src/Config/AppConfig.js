import dotenv from 'dotenv';
import RateLimiter from './rateLimiter.js'

dotenv.config();

export default {
  PORT: process.env.PORT,
  RateLimiter: RateLimiter,
  MONGO_URI: process.env.MONGO_URI || "",
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || "",
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "",
  CLERK_JWT_ISSUER: process.env.CLERK_JWT_ISSUER || "",
  CLERK_JWKS_URL: process.env.CLERK_JWKS_URL || "",
  CLERK_JWT_TEMPLATE_NAME: process.env.CLERK_JWT_TEMPLATE_NAME || "",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
};