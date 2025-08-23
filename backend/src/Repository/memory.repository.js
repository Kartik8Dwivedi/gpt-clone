import CrudRepository from "./crud.repository.js";
import Memory from "../Models/memory.model.js";

class MemoryRepository extends CrudRepository {
  constructor() {
    super(Memory);
  }

  async findByConversation(conversationId) {
    return this.model.find({ conversationId }).sort({ createdAt: -1 });
  }

  async findByUser(userId) {
    return this.model.find({ userId }).sort({ createdAt: -1 });
  }

  async getForConversation(conversationId) {
    return this.model.find({ conversationId }).sort({ createdAt: -1 });
  }
}

export default MemoryRepository;
