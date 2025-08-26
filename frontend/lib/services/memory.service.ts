import MemoryRepository from '../repositories/memory.repository';
import { IMemory } from '../models/memory.model';
import { Types } from 'mongoose';
import logger from '../logger';

class MemoryService {
  private memoryRepo: MemoryRepository;

  constructor() {
    this.memoryRepo = new MemoryRepository();
  }

  async addMemory(userId: string, conversationId: Types.ObjectId, key: string, value: any): Promise<{ data: IMemory; message: string }> {
    try {
      const memory = await this.memoryRepo.create({
        userId,
        conversationId,
        key,
        value,
      });
      return { data: memory, message: "Memory added successfully" };
    } catch (error: any) {
      logger.error("Error adding memory:", error.message);
      throw error;
    }
  }

  async getConversationMemory(conversationId: Types.ObjectId): Promise<{ data: IMemory[]; message: string }> {
    try {
      const memories = await this.memoryRepo.findByConversation(conversationId);
      return { data: memories, message: "Fetched conversation memories" };
    } catch (error: any) {
      logger.error("Error fetching conversation memories:", error.message);
      throw error;
    }
  }

  async getUserMemory(userId: string): Promise<{ data: IMemory[]; message: string }> {
    try {
      const memories = await this.memoryRepo.findByUser(userId);
      return { data: memories, message: "Fetched user memories" };
    } catch (error: any) {
      logger.error("Error fetching user memories:", error.message);
      throw error;
    }
  }

  async updateMemory(memoryId: string, value: any): Promise<{ data: IMemory; message: string }> {
    try {
      const updated = await this.memoryRepo.update(memoryId, { value });
      if (!updated) {
        throw new Error("Memory not found");
      }
      return { data: updated, message: "Memory updated successfully" };
    } catch (error: any) {
      logger.error("Error updating memory:", error.message);
      throw error;
    }
  }

  async deleteMemory(memoryId: string): Promise<{ data: IMemory; message: string }> {
    try {
      const deleted = await this.memoryRepo.destroy(memoryId);
      if (!deleted) {
        throw new Error("Memory not found");
      }
      return { data: deleted, message: "Memory deleted successfully" };
    } catch (error: any) {
      logger.error("Error deleting memory:", error.message);
      throw error;
    }
  }
}

export default MemoryService;
