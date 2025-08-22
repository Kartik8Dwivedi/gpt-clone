class CrudService {
  constructor(repository) {
    this.repository = repository;
  }

  async create(data) {
    try {
      const response = await this.repository.create(data);
      return response;
    } catch (error) {
      console.log("Something went wrong in crud service");
      throw error;
    }
  }
  async destroy(id) {
    try {
      // first we will try to soft delete the product by changing its value of isActive false, if this field is not there then we can delete it!
      const response = await this.repository.destroy(id);
      return response;
    } catch (error) {
      console.log("Something went wrong in crud service");
      throw error;
    }
  }
  async get(id) {
    try {
      const response = await this.repository.get(id);
      return response;
    } catch (error) {
      console.log("Something went wrong in crud service");
      throw error;
    }
  }
  async getAll() {
    try {
      const response = await this.repository.getAll();
      return response;
    } catch (error) {
      console.log("Something went wrong in crud service");
      throw error;
    }
  }
  async update(id, data) {
    try {
      const response = await this.repository.update(id, data);
      return response;
    } catch (error) {
      console.log("Something went wrong in crud service");
      throw error;
    }
  }
}

export default CrudService;
