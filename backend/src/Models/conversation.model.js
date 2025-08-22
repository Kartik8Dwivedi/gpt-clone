import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // Clerk userId
    title: { type: String, default: "New Chat" },
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", ConversationSchema);
