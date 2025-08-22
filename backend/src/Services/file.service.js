import FileRepository from "../Repository/file.repository.js";
import cloudinary from "../Utils/cloudinary.js";

class FileService {
  constructor() {
    this.fileRepo = new FileRepository();
  }

  async uploadFile(userId, filePath, type, size) {
    const uploadRes = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    const file = await this.fileRepo.create({
      userId,
      url: uploadRes.secure_url,
      type,
      size,
      metadata: uploadRes,
    });

    return { data: file, message: "File uploaded successfully" };
  }

  async getUserFiles(userId) {
    const files = await this.fileRepo.findByUser(userId);
    return { data: files, message: "Fetched user files" };
  }

  async getFile(fileId) {
    const file = await this.fileRepo.get(fileId);
    if (!file) throw new Error("File not found");
    return { data: file, message: "Fetched file details" };
  }

  async deleteFile(fileId) {
    const file = await this.fileRepo.get(fileId);
    if (!file) throw new Error("File not found");

    // delete from cloudinary
    const publicId = file.metadata?.public_id;
    if (publicId) await cloudinary.uploader.destroy(publicId);

    await this.fileRepo.destroy(fileId);
    return { data: file, message: "File deleted successfully" };
  }
}

export default FileService;
