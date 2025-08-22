import logger from "../Config/logger.js";

class CrudRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    logger.info(`Attempting to create new ${this.model.modelName} record.`);
    try {
      const result = await this.model.create(data);
      logger.success(
        `${this.model.modelName} record created successfully with ID: ${result._id}`
      );
      return result;
    } catch (error) {
      logger.error(
        `Error creating ${this.model.modelName} record: ${error.message}`
      );
      throw error;
    }
  }

  async get(id) {
    logger.info(
      `Attempting to get ${this.model.modelName} record by ID: ${id}`
    );
    try {
      const result = await this.model.findById(id);
      if (result) {
        logger.success(
          `${this.model.modelName} record fetched successfully by ID: ${id}`
        );
      } else {
        logger.warn(`${this.model.modelName} record not found by ID: ${id}`);
      }
      return result;
    } catch (error) {
      logger.error(
        `Error getting ${this.model.modelName} record by ID ${id}: ${error.message}`
      );
      throw error;
    }
  }

  async getAll(filter = {}, projection = null, options = {}) {
    logger.info(`Attempting to get all ${this.model.modelName} records.`);
    try {
      const result = await this.model.find(filter, projection, options);
      logger.success(
        `Fetched ${result.length} ${this.model.modelName} records.`
      );
      return result;
    } catch (error) {
      logger.error(
        `Error getting all ${this.model.modelName} records: ${error.message}`
      );
      throw error;
    }
  }

  async update(id, data) {
    logger.info(
      `Attempting to update ${this.model.modelName} record with ID: ${id}`
    );
    try {
      const result = await this.model.findByIdAndUpdate(id, data, {
        new: true,
      });
      if (result) {
        logger.success(
          `${this.model.modelName} record updated successfully with ID: ${id}`
        );
      } else {
        logger.warn(
          `${this.model.modelName} record not found for update with ID: ${id}`
        );
      }
      return result;
    } catch (error) {
      logger.error(
        `Error updating ${this.model.modelName} record ${id}: ${error.message}`
      );
      throw error;
    }
  }

  async destroy(id) {
    logger.info(
      `Attempting to delete ${this.model.modelName} record with ID: ${id}`
    );
    try {
      const result = await this.model.findByIdAndDelete(id);
      if (result) {
        logger.success(
          `${this.model.modelName} record deleted successfully with ID: ${id}`
        );
      } else {
        logger.warn(
          `${this.model.modelName} record not found for deletion with ID: ${id}`
        );
      }
      return result;
    } catch (error) {
      logger.error(
        `Error deleting ${this.model.modelName} record ${id}: ${error.message}`
      );
      throw error;
    }
  }

  async insertMany(dataArray) {
    logger.info(
      `Attempting to insert ${dataArray.length} ${this.model.modelName} records.`
    );
    try {
      const result = await this.model.insertMany(dataArray);
      logger.success(
        `Successfully inserted ${result.length} ${this.model.modelName} records.`
      );
      return result;
    } catch (error) {
      logger.error(
        `Error inserting many ${this.model.modelName} records: ${error.message}`
      );
      throw error;
    }
  }

  async updateBulk(filter, data) {
    logger.info(
      `Attempting to bulk update ${
        this.model.modelName
      } records with filter: ${JSON.stringify(filter)}.`
    );
    try {
      const result = await this.model.updateMany(filter, data);
      logger.success(
        `Bulk updated ${result.modifiedCount} ${this.model.modelName} records.`
      );
      return result;
    } catch (error) {
      logger.error(
        `Error bulk updating ${this.model.modelName} records: ${error.message}`
      );
      throw error;
    }
  }

  async deleteMany(filter) {
    logger.info(
      `Attempting to delete many ${
        this.model.modelName
      } records with filter: ${JSON.stringify(filter)}.`
    );
    try {
      const result = await this.model.deleteMany(filter);
      logger.success(
        `Deleted ${result.deletedCount} ${this.model.modelName} records.`
      );
      return result;
    } catch (error) {
      logger.error(
        `Error deleting many ${this.model.modelName} records: ${error.message}`
      );
      throw error;
    }
  }

  // 🔍 Find one with filter
  async findOne(filter, projection = null, options = {}) {
    logger.info(
      `Attempting to find one ${
        this.model.modelName
      } record with filter: ${JSON.stringify(filter)}.`
    );
    try {
      const result = await this.model.findOne(filter, projection, options);
      if (result) {
        logger.success(`${this.model.modelName} record found with filter.`);
      } else {
        logger.warn(`${this.model.modelName} record not found with filter.`);
      }
      return result;
    } catch (error) {
      logger.error(
        `Error finding one ${this.model.modelName} record: ${error.message}`
      );
      throw error;
    }
  }

  // 🔄 Upsert (update if exists, insert if not)
  async upsert(filter, data) {
    logger.info(
      `Attempting to upsert ${
        this.model.modelName
      } record with filter: ${JSON.stringify(filter)}.`
    );
    try {
      const result = await this.model.findOneAndUpdate(filter, data, {
        new: true,
        upsert: true,
      });
      logger.success(
        `${this.model.modelName} record upserted successfully with ID: ${result._id}`
      );
      return result;
    } catch (error) {
      logger.error(
        `Error upserting ${this.model.modelName} record: ${error.message}`
      );
      throw error;
    }
  }

  // 🔢 Pagination support
  async paginate(
    filter = {},
    page = 1,
    limit = 10,
    projection = null,
    options = {}
  ) {
    logger.info(
      `Attempting to paginate ${this.model.modelName} records (page: ${page}, limit: ${limit}).`
    );
    try {
      const skip = (page - 1) * limit;
      const data = await this.model.find(filter, projection, {
        ...options,
        skip,
        limit,
      });
      const total = await this.model.countDocuments(filter);
      logger.success(
        `Paginated ${this.model.modelName} records. Total: ${total}, Page: ${page}.`
      );
      return {
        data,
        meta: {
          total,
          page,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error(
        `Error paginating ${this.model.modelName} records: ${error.message}`
      );
      throw error;
    }
  }

  // 🔗 Aggregate Pipelines (e.g., for joins or complex queries)
  async aggregate(pipeline = []) {
    logger.info(
      `Attempting to aggregate ${
        this.model.modelName
      } records with pipeline: ${JSON.stringify(pipeline)}.`
    );
    try {
      const result = await this.model.aggregate(pipeline);
      logger.success(
        `Aggregated ${this.model.modelName} records. Result count: ${result.length}.`
      );
      return result;
    } catch (error) {
      logger.error(
        `Error aggregating ${this.model.modelName} records: ${error.message}`
      );
      throw error;
    }
  }

  // Exists check
  async exists(filter) {
    logger.info(
      `Attempting to check existence of ${
        this.model.modelName
      } record with filter: ${JSON.stringify(filter)}.`
    );
    try {
      const result = await this.model.exists(filter);
      logger.success(
        `${this.model.modelName} record existence check: ${!!result}.`
      );
      return result;
    } catch (error) {
      logger.error(
        `Error checking existence of ${this.model.modelName} record: ${error.message}`
      );
      throw error;
    }
  }

  async count(filter = {}) {
    logger.info(
      `Attempting to count ${
        this.model.modelName
      } records with filter: ${JSON.stringify(filter)}.`
    );
    try {
      const result = await this.model.countDocuments(filter);
      logger.success(`Counted ${result} ${this.model.modelName} records.`);
      return result;
    } catch (error) {
      logger.error(
        `Error counting ${this.model.modelName} records: ${error.message}`
      );
      throw error;
    }
  }
}

export default CrudRepository;
