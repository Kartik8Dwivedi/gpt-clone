import CrudRepository from './crud.repository';
import Conversation, { IConversation } from '../models/conversation.model'; // Import the Conversation model and interface

class ConversationRepository extends CrudRepository<IConversation> {
  constructor() {
    super(Conversation);
  }

  async findByUser(userId: string): Promise<IConversation[]> {
    return this.model.find({ userId }).sort({ updatedAt: -1 });
  }

  async findById(conversationId: string): Promise<IConversation | null> {
    return this.model.findById(conversationId);
  }
}

export default ConversationRepository;
