import CrudRepository from "./crud.repository.js";
import Message from "../Models/message.model.js";

class MessageRepository extends CrudRepository {
  constructor() {
    super(Message);
  }

  async findByConversation(conversationId) {
    return this.model.find({ conversationId }).sort({ createdAt: 1 });
  }
}

export default MessageRepository;
