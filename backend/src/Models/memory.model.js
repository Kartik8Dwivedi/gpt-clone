import mongoose from "mongoose";

const MemorySchema = new mongoose.Schema(
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

export default mongoose.model("Memory", MemorySchema);
