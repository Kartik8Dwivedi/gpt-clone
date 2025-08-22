import CrudRepository from "./crud.repository.js";
import User from "../Models/user.model.js";

class UserRepository extends CrudRepository {
  constructor() {
    super(User);
  }

  // Example: model-specific method
  async findByClerkId(clerkId) {
    return this.model.findOne({ clerkId });
  }
}

export default UserRepository;
