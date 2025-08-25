import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  sender: 'user' | 'ai' | 'assistant';
  content: string;
  files?: string[];
  edited: boolean;
}

const MessageSchema: Schema = new Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: { type: String, enum: ["user", "ai", "assistant"], required: true },
    content: { type: String, required: true },
    files: [{ type: String }],
    edited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
