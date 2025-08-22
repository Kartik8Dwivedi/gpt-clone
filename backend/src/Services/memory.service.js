import MemoryRepository from "../repositories/MemoryRepository.js";

class MemoryService {
  constructor() {
    this.memoryRepo = new MemoryRepository();
  }

  async addMemory(userId, conversationId, key, value) {
    const memory = await this.memoryRepo.create({
      userId,
      conversationId,
      key,
      value,
    });
    return { data: memory, message: "Memory added successfully" };
  }

  async getConversationMemory(conversationId) {
    const memories = await this.memoryRepo.findByConversation(conversationId);
    return { data: memories, message: "Fetched conversation memories" };
  }

  async getUserMemory(userId) {
    const memories = await this.memoryRepo.findByUser(userId);
    return { data: memories, message: "Fetched user memories" };
  }

  async updateMemory(memoryId, value) {
    const updated = await this.memoryRepo.update(memoryId, { value });
    if (!updated) throw new Error("Memory not found");
    return { data: updated, message: "Memory updated successfully" };
  }

  async deleteMemory(memoryId) {
    const deleted = await this.memoryRepo.destroy(memoryId);
    if (!deleted) throw new Error("Memory not found");
    return { data: deleted, message: "Memory deleted successfully" };
  }
}

export default MemoryService;
