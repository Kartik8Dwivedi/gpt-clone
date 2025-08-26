import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
  userId: string;
  title: string;
}

const ConversationSchema: Schema = new Schema(
  {
    userId: { type: String, required: true }, // Clerk userId
    title: { type: String, default: "New Chat" },
  },
  { timestamps: true }
);

const Conversation = mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);

export default Conversation;
