import CrudRepository from "./crud.repository.js";
import Conversation from "../Models/conversation.model.js";

class ConversationRepository extends CrudRepository {
  constructor() {
    super(Conversation);
  }

  async findByUser(userId) {
    return this.model.find({ userId }).sort({ updatedAt: -1 });
  }
}

export default ConversationRepository;
