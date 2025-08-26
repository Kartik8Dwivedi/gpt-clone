import logger from '../logger'; // Import the logger
import { Document } from 'mongoose';
import CrudRepository from '../repositories/crud.repository'; // Assuming CrudRepository is in the same lib folder

class CrudService<T extends Document> {
  protected repository: CrudRepository<T>;

  constructor(repository: CrudRepository<T>) {
    this.repository = repository;
  }

  async create(data: Partial<T>): Promise<T> {
    try {
      const response = await this.repository.create(data);
      return response;
    } catch (error: any) {
      logger.error("Error in crud service (create):", error.message);
      throw error;
    }
  }

  async destroy(id: string): Promise<T | null> {
    try {
      const response = await this.repository.destroy(id);
      return response;
    } catch (error: any) {
      logger.error("Error in crud service (destroy):", error.message);
      throw error;
    }
  }

  async get(id: string): Promise<T | null> {
    try {
      const response = await this.repository.get(id);
      return response;
    } catch (error: any) {
      logger.error("Error in crud service (get):", error.message);
      throw error;
    }
  }

  async getAll(): Promise<T[]> {
    try {
      const response = await this.repository.getAll();
      return response;
    } catch (error: any) {
      logger.error("Error in crud service (getAll):", error.message);
      throw error;
    }
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    try {
      const response = await this.repository.update(id, data);
      return response;
    } catch (error: any) {
      logger.error("Error in crud service (update):", error.message);
      throw error;
    }
  }
}

export default CrudService;
