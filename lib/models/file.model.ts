import mongoose, { Document, Schema } from 'mongoose';

export interface IFile extends Document {
  userId: string;
  url: string;
  type?: string;
  size?: number;
  metadata?: object;
}

const FileSchema: Schema = new Schema(
  {
    userId: { type: String, required: true }, // Clerk user ID
    url: { type: String, required: true }, // Cloudinary URL
    type: { type: String }, // image, pdf, etc.
    size: { type: Number },
    metadata: { type: Object },
  },
  { timestamps: true }
);

const File = mongoose.models.File || mongoose.model<IFile>('File', FileSchema);

export default File;
