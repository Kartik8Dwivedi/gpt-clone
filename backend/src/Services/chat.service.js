import ConversationRepository from "../Repository/conversation.repository.js";
import MessageRepository from "../Repository/message.repository.js";
import MemoryRepository from "../Repository/memory.repository.js";
import AIService from "./ai.service.js";

class ChatService {
  constructor() {
    this.conversationRepo = new ConversationRepository();
    this.messageRepo = new MessageRepository();
    this.memoryRepo = new MemoryRepository();
  }

  async createConversation(userId, title) {
    const conversation = await this.conversationRepo.create({ userId, title });
    return { data: conversation, message: "Conversation created successfully" };
  }

  async getUserConversations(userId) {
    const conversations = await this.conversationRepo.findByUser(userId);
    return { data: conversations, message: "Fetched user conversations" };
  }

  async getConversation(conversationId) {
    const messages = await this.messageRepo.findByConversation(conversationId);
    return { data: messages, message: "Fetched conversation messages" };
  }

  async addMessage(conversationId, sender, content, files = []) {
    const userMessage = await this.messageRepo.create({
      conversationId,
      sender,
      content,
      files,
    });

    let aiMessage = null;

    if (sender === "user") {
      const conversation = await this.conversationRepo.findById(conversationId);
      const messages = await this.messageRepo.findByConversation(
        conversationId
      );

      const memory = await this.memoryRepo.getForConversation(conversationId);

      const aiReply = await AIService.generateResponse(messages, memory);

      aiMessage = await this.messageRepo.create({
        conversationId,
        sender: "assistant",
        content: aiReply,
        files: [],
      });
    }

    // 5. Return both messages
    return {
      data: {
        userMessage,
        aiMessage,
      },
      message: "Message added successfully",
    };
  }

  async editMessage(messageId, newContent) {
    const updated = await this.messageRepo.update(messageId, {
      content: newContent,
      edited: true,
    });
    return { data: updated, message: "Message updated successfully" };
  }

  async deleteMessage(messageId) {
    const deleted = await this.messageRepo.destroy(messageId);
    return { data: deleted, message: "Message deleted successfully" };
  }

  async deleteConversation(conversationId) {
    await this.conversationRepo.destroy(conversationId);
    await this.messageRepo.deleteMany({ conversationId });
    return { message: "Conversation deleted successfully" };
  }
}

export default ChatService;
