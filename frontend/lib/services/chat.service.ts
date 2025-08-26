import ConversationRepository from "../repositories/conversation.repository";
import MessageRepository from "../repositories/message.repository";
import MemoryRepository from "../repositories/memory.repository";
import AIService from "./ai.service";
import { IConversation } from "../models/conversation.model";
import { IMessage } from "../models/message.model";
import mongoose, { Types } from "mongoose";
import logger from "../logger";
import { google } from "@ai-sdk/google";
import AppConfig from "../config";
import { streamText } from "ai";

interface AddMessageParams {
  userId: string;
  conversationId: Types.ObjectId;
  sender: "user" | "ai" | "assistant";
  content: string;
  files?: string[];
}

const googleProvider = google({
  apiKey: AppConfig.GEMINI_API_KEY,
});


class ChatService {
  private conversationRepo: ConversationRepository;
  private messageRepo: MessageRepository;
  private memoryRepo: MemoryRepository;

  constructor() {
    this.conversationRepo = new ConversationRepository();
    this.messageRepo = new MessageRepository();
    this.memoryRepo = new MemoryRepository();
  }

  async createConversation(
    userId: string,
    title: string
  ): Promise<{ data: IConversation; message: string }> {
    try {
      const conversation = await this.conversationRepo.create({
        userId,
        title,
      });
      return {
        data: conversation,
        message: "Conversation created successfully",
      };
    } catch (error: any) {
      logger.error("Error creating conversation:", error.message);
      throw error;
    }
  }

  async getUserConversations(
    userId: string
  ): Promise<{ data: IConversation[]; message: string }> {
    try {
      const conversations = await this.conversationRepo.findByUser(userId);
      return { data: conversations, message: "Fetched user conversations" };
    } catch (error: any) {
      logger.error("Error fetching user conversations:", error.message);
      throw error;
    }
  }

  async getConversation(
    conversationId: Types.ObjectId
  ): Promise<{ data: IMessage[]; message: string }> {
    try {
      const messages = await this.messageRepo.findByConversation(
        conversationId
      );
      return { data: messages, message: "Fetched conversation messages" };
    } catch (error: any) {
      logger.error("Error fetching conversation messages:", error.message);
      throw error;
    }
  }

  async addMessage(
    userId: string,
    conversationId: Types.ObjectId | string,
    sender: "user" | "ai" | "assistant",
    content: string,
    files: string[] = []
  ): Promise<{ data: IMessage; message: string }> {
    try {
      const convId =
        typeof conversationId === "string"
          ? new Types.ObjectId(conversationId)
          : conversationId;

      const messagePayload = {
        conversationId: convId,
        sender,
        content,
        files,
        userId,
      };

      const message = await this.messageRepo.create(messagePayload);

      // If the conversation is new, generate a title
      if (sender === "user") {
        const conversation = await this.conversationRepo.findById(convId);
        if (conversation && conversation.title === "New Chat") {
          const messages = await this.messageRepo.findByConversation(convId);
          const title = await AIService.generateTitle(
            messages.map((msg) => ({
              sender: msg.sender,
              content: msg.content,
            }))
          );
          await this.conversationRepo.update(convId.toString(), { title });
        }
      }

      await this.conversationRepo.findByIdAndUpdate(convId, {
        $set: { updatedAt: new Date() },
      });

      return { data: message, message: "Message added successfully" };
    } catch (error: any) {
      logger.error("Error adding message:", error.message);
      throw error;
    }
  }

  async editMessage(
    messageId: string,
    userId: string,
    newContent: string
  ): Promise<{ data: IMessage | null; message: string }> {
    try {
      const updated = await this.messageRepo.update(
        { _id: messageId, userId },
        {
          content: newContent,
          edited: true,
        }
      );
      if (!updated) {
        throw new Error("Message not found or user not authorized");
      }
      return { data: updated, message: "Message updated successfully" };
    } catch (error: any) {
      logger.error("Error editing message:", error.message);
      throw error;
    }
  }

  async deleteMessage(
    messageId: string,
    userId: string
  ): Promise<{ data: any; message: string }> {
    try {
      const result = await this.messageRepo.destroy({
        _id: messageId,
        userId: userId,
      });

      if (!result || result.deletedCount === 0) {
        throw new Error("Message not found or user not authorized to delete");
      }

      return { data: result, message: "Message deleted successfully" };
    } catch (error: any) {
      logger.error("Error deleting message:", error.message);
      throw error;
    }
  }

  async deleteConversation(
    conversationId: string
  ): Promise<{ message: string }> {
    try {
      await this.conversationRepo.destroy(conversationId);
      await this.messageRepo.deleteMany({
        conversationId: new Types.ObjectId(conversationId),
      });
      return { message: "Conversation deleted successfully" };
    } catch (error: any) {
      logger.error("Error deleting conversation:", error.message);
      throw error;
    }
  }

  async regenerateMessage(
    conversationId: Types.ObjectId,
    historyMessages: any[],
    request: Request
  ) {
    return this.streamAssistantReply(historyMessages, request);
  }

  async streamAssistantReply(messages: any[], request: Request) {
    const result = await streamText({
      model: google("models/gemini-1.5-flash", {
        apiKey: AppConfig.GEMINI_API_KEY,
      }),
      messages, // now already normalized into {role, parts[]}
    });

    return result.toTextStreamResponse();
  }
}

export default ChatService;
