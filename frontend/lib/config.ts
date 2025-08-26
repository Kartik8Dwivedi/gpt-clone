
interface AppConfig {
  PORT: string | undefined;
  MONGO_URI: string;
  CLERK_SECRET_KEY: string;
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  CLERK_JWT_ISSUER: string;
  CLERK_JWKS_URL: string;
  CLERK_JWT_TEMPLATE_NAME: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  GEMINI_API_KEY: string;
  MEM0_API_KEY: string;
}

const AppConfig: AppConfig = {
  PORT: process.env.PORT,
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
  GEMINI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
  MEM0_API_KEY: process.env.MEM0_API_KEY || "",
};

export default AppConfig;
