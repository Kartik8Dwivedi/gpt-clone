import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMemory extends Document {
  userId: string;
  conversationId?: Types.ObjectId;
  key: string;
  value?: any; // Mixed type in Mongoose
}

const MemorySchema: Schema = new Schema(
  {
    userId: { type: String, required: true }, // Clerk user ID
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    key: { type: String, required: true }, //  "topic"/"persona"
    value: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

const Memory = mongoose.models.Memory || mongoose.model<IMemory>('Memory', MemorySchema);

export default Memory;
