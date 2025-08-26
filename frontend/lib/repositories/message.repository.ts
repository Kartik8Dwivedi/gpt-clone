import CrudRepository from './crud.repository';
import Message, { IMessage } from '../models/message.model'; // Import the Message model and interface
import { Types } from 'mongoose';

class MessageRepository extends CrudRepository<IMessage> {
  constructor() {
    super(Message);
  }

  async findByConversation(conversationId: Types.ObjectId): Promise<IMessage[]> {
    return this.model.find({ conversationId }).sort({ createdAt: 1 });
  }
}

export default MessageRepository;
