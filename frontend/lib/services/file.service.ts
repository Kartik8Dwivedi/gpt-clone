import FileRepository from '../repositories/file.repository';
import cloudinary from '../utils/cloudinary'; // Import the new cloudinary utility
import { IFile } from '../models/file.model';
import logger from '../logger';

class FileService {
  private fileRepo: FileRepository;

  constructor() {
    this.fileRepo = new FileRepository();
  }

  async uploadFile(userId: string, filePath: string, type: string, size: number): Promise<{ data: IFile; message: string }> {
    try {
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
    } catch (error: any) {
      logger.error("Error uploading file:", error.message);
      throw error;
    }
  }

  async getUserFiles(userId: string): Promise<{ data: IFile[]; message: string }> {
    try {
      const files = await this.fileRepo.findByUser(userId);
      return { data: files, message: "Fetched user files" };
    } catch (error: any) {
      logger.error("Error fetching user files:", error.message);
      throw error;
    }
  }

  async getFile(fileId: string): Promise<{ data: IFile; message: string }> {
    try {
      const file = await this.fileRepo.get(fileId);
      if (!file) {
        throw new Error("File not found");
      }
      return { data: file, message: "Fetched file details" };
    } catch (error: any) {
      logger.error("Error getting file:", error.message);
      throw error;
    }
  }

  async deleteFile(fileId: string): Promise<{ data: IFile | null; message: string }> {
    try {
      const file = await this.fileRepo.get(fileId);
      if (!file) {
        throw new Error("File not found");
      }

      // delete from cloudinary
      const publicId = (file.metadata as any)?.public_id; // Cast to any to access public_id
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }

      await this.fileRepo.destroy(fileId);
      return { data: file, message: "File deleted successfully" };
    } catch (error: any) {
      logger.error("Error deleting file:", error.message);
      throw error;
    }
  }
}

export default FileService;
