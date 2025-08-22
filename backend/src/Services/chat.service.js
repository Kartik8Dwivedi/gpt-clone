import ConversationRepository from "../Repository/conversation.repository.js";
import MessageRepository from "../Repository/message.repository.js";

class ChatService {
  constructor() {
    this.conversationRepo = new ConversationRepository();
    this.messageRepo = new MessageRepository();
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
    const message = await this.messageRepo.create({
      conversationId,
      sender,
      content,
      files,
    });
    return { data: message, message: "Message added successfully" };
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
}

export default ChatService;
