import CrudRepository from './crud.repository';
import User, { IUser } from '../models/user.model'; // Import the User model and interface

class UserRepository extends CrudRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByClerkId(clerkId: string): Promise<IUser | null> {
    return this.model.findOne({ clerkId });
  }
}

export default UserRepository;
