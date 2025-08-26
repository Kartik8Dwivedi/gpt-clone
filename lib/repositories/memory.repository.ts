import CrudRepository from './crud.repository';
import Memory, { IMemory } from '../models/memory.model'; // Import the Memory model and interface
import { Types } from 'mongoose';

class MemoryRepository extends CrudRepository<IMemory> {
  constructor() {
    super(Memory);
  }

  async findByConversation(conversationId: Types.ObjectId): Promise<IMemory[]> {
    return this.model.find({ conversationId }).sort({ createdAt: -1 });
  }

  async findByUser(userId: string): Promise<IMemory[]> {
    return this.model.find({ userId }).sort({ createdAt: -1 });
  }

  async getForConversation(conversationId: Types.ObjectId): Promise<IMemory[]> {
    return this.model.find({ conversationId }).sort({ createdAt: -1 });
  }
}

export default MemoryRepository;
