import mongoose from "mongoose";

import logger from "./logger.js";
import AppConfig from "./AppConfig.js";

const connectToDB = async () => {
  try {
    await mongoose.connect(AppConfig.MONGO_URI);
    logger.success("MongoDB connected successfully");
  } catch (error) {
    logger.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectToDB;
