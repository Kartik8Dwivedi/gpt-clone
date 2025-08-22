import mongoose from "mongoose";

const FileSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // Clerk user ID
    url: { type: String, required: true }, // Cloudinary URL
    type: { type: String }, // image, pdf, etc.
    size: { type: Number },
    metadata: { type: Object },
  },
  { timestamps: true }
);

export default mongoose.model("File", FileSchema);
