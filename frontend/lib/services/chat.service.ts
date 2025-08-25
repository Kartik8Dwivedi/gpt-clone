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
  ): Promise<AsyncIterable<string>> {
    try {
      // Normalize ObjectId
      const convId =
        typeof conversationId === "string"
          ? new Types.ObjectId(conversationId)
          : conversationId;
      // Build the message payload safely
      //@ts-ignore
      const messagePayload: Partial<IMessage> = {
        conversationId: convId,
        sender: sender,
        content: content?.toString() ?? "",
        files: Array.isArray(files) ? files : [],
        userId: userId,
      };
      logger.info(
        "Attempting to create new Message record with:",
        messagePayload
      );

      // Validate required fields before calling repo
      if (!messagePayload.conversationId)
        throw new Error("conversationId is required");
      if (!messagePayload.sender) throw new Error("sender is required");
      if (!messagePayload.content || messagePayload.content.trim() === "")
        throw new Error("content is required");

      const userMessage = await this.messageRepo.create(messagePayload);

      let aiMessage: IMessage | null = null;
      let updatedConversation: IConversation | null = null;

      if (sender === "user") {
        const conversation = await this.conversationRepo.findById(convId);
        if (!conversation) throw new Error("Conversation not found");

        const messages = await this.messageRepo.findByConversation(convId);

        if (conversation.title === "New Chat") {
          const title = await AIService.generateTitle(
            messages.map((msg) => ({
              sender: msg.sender,
              content: msg.content,
            }))
          );

          updatedConversation = await this.conversationRepo.update(
            convId.toString(),
            {
              title,
            }
          );
        }

        // Generate AI response
        return AIService.generateResponse(
          String(userId),
          String(convId),
          content
        );
      }
    } catch (error: any) {
      logger.error("Error adding message:", error.message);
      throw error;
    }
  }

  async editMessage(
    messageId: string,
    newContent: string
  ): Promise<{ data: IMessage | null; message: string }> {
    try {
      const updated = await this.messageRepo.update(messageId, {
        content: newContent,
        edited: true,
      });
      return { data: updated, message: "Message updated successfully" };
    } catch (error: any) {
      logger.error("Error editing message:", error.message);
      throw error;
    }
  }

  async deleteMessage(
    messageId: string
  ): Promise<{ data: IMessage | null; message: string }> {
    try {
      const deleted = await this.messageRepo.destroy(messageId);
      return { data: deleted, message: "Message deleted successfully" };
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
    content: string
  ): Promise<{ data: { aiMessage: IMessage }; message: string }> {
    try {
      const aiReply = await AIService.generateResponse(
        [{ sender: "user", content: `tell me a better answer for ${content}` }],
        null
      );

      const aiMessage = await this.messageRepo.create({
        conversationId,
        sender: "assistant",
        content: aiReply,
        files: [],
      });

      return {
        data: {
          aiMessage,
        },
        message: "Message regenerated successfully",
      };
    } catch (error: any) {
      logger.error("Error regenerating message:", error.message);
      throw error;
    }
  }

  async streamAssistantReply(messages: any[], request: Request) {
    const result = await streamText({
      // Pass model + apiKey here directly
      model: google("models/gemini-1.5-flash", {
        apiKey: AppConfig.GEMINI_API_KEY,
      }),
      messages,
    });

    return result.toTextStreamResponse();
  }
}

export default ChatService;
