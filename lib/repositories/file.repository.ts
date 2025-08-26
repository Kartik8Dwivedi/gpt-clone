import CrudRepository from './crud.repository';
import File, { IFile } from '../models/file.model'; // Import the File model and interface

class FileRepository extends CrudRepository<IFile> {
  constructor() {
    super(File);
  }

  async findByUser(userId: string): Promise<IFile[]> {
    return this.model.find({ userId }).sort({ createdAt: -1 });
  }
}

export default FileRepository;
