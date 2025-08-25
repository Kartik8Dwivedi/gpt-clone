import ConversationRepository from '../repositories/conversation.repository';
import MessageRepository from '../repositories/message.repository';
import MemoryRepository from '../repositories/memory.repository';
import AIService from './ai.service';
import { IConversation } from '../models/conversation.model';
import { IMessage } from '../models/message.model';
import { Types } from 'mongoose';
import logger from '../logger';

class ChatService {
  private conversationRepo: ConversationRepository;
  private messageRepo: MessageRepository;
  private memoryRepo: MemoryRepository;

  constructor() {
    this.conversationRepo = new ConversationRepository();
    this.messageRepo = new MessageRepository();
    this.memoryRepo = new MemoryRepository();
  }

  async createConversation(userId: string, title: string): Promise<{ data: IConversation; message: string }> {
    try {
      const conversation = await this.conversationRepo.create({ userId, title });
      return { data: conversation, message: "Conversation created successfully" };
    } catch (error: any) {
      logger.error("Error creating conversation:", error.message);
      throw error;
    }
  }

  async getUserConversations(userId: string): Promise<{ data: IConversation[]; message: string }> {
    try {
      const conversations = await this.conversationRepo.findByUser(userId);
      return { data: conversations, message: "Fetched user conversations" };
    } catch (error: any) {
      logger.error("Error fetching user conversations:", error.message);
      throw error;
    }
  }

  async getConversation(conversationId: Types.ObjectId): Promise<{ data: IMessage[]; message: string }> {
    try {
      const messages = await this.messageRepo.findByConversation(conversationId);
      return { data: messages, message: "Fetched conversation messages" };
    } catch (error: any) {
      logger.error("Error fetching conversation messages:", error.message);
      throw error;
    }
  }

  async addMessage(
    conversationId: Types.ObjectId,
    sender: 'user' | 'ai' | 'assistant',
    content: string,
    files: string[] = []
  ): Promise<{ data: { userMessage: IMessage; aiMessage: IMessage | null; updatedConversation: IConversation | null }; message: string }> {
    try {
      const userMessage = await this.messageRepo.create({
        conversationId,
        sender,
        content,
        files,
      });

      let aiMessage: IMessage | null = null;
      let updatedConversation: IConversation | null = null;

      if (sender === "user") {
        const conversation = await this.conversationRepo.findById(conversationId);
        if (!conversation) {
          throw new Error("Conversation not found.");
        }
        const messages = await this.messageRepo.findByConversation(conversationId);

        if (conversation.title === "New Chat") {
          const title = await AIService.generateTitle(messages.map(msg => ({ sender: msg.sender, content: msg.content })));
          updatedConversation = await this.conversationRepo.update(conversationId.toString(), { title });
        }

        const memory = await this.memoryRepo.getForConversation(conversationId);

        const aiReply = await AIService.generateResponse(
          messages.map(msg => ({ sender: msg.sender, content: msg.content })),
          memory.length > 0 ? JSON.stringify(memory) : null // Convert memory to string if it exists
        );

        aiMessage = await this.messageRepo.create({
          conversationId,
          sender: "assistant",
          content: aiReply,
          files: [],
        });
      }

      return {
        data: {
          userMessage,
          aiMessage,
          updatedConversation,
        },
        message: "Message added successfully",
      };
    } catch (error: any) {
      logger.error("Error adding message:", error.message);
      throw error;
    }
  }

  async editMessage(messageId: string, newContent: string): Promise<{ data: IMessage | null; message: string }> {
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

  async deleteMessage(messageId: string): Promise<{ data: IMessage | null; message: string }> {
    try {
      const deleted = await this.messageRepo.destroy(messageId);
      return { data: deleted, message: "Message deleted successfully" };
    } catch (error: any) {
      logger.error("Error deleting message:", error.message);
      throw error;
    }
  }

  async deleteConversation(conversationId: string): Promise<{ message: string }> {
    try {
      await this.conversationRepo.destroy(conversationId);
      await this.messageRepo.deleteMany({ conversationId: new Types.ObjectId(conversationId) });
      return { message: "Conversation deleted successfully" };
    } catch (error: any) {
      logger.error("Error deleting conversation:", error.message);
      throw error;
    }
  }

  async regenerateMessage(conversationId: Types.ObjectId, content: string): Promise<{ data: { aiMessage: IMessage }; message: string }> {
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
}

export default ChatService;
