import CrudRepository from "./crud.repository.js";
import File from "../Models/file.model.js";

class FileRepository extends CrudRepository {
  constructor() {
    super(File);
  }

  async findByUser(userId) {
    return this.model.find({ userId }).sort({ createdAt: -1 });
  }
}

export default FileRepository;
