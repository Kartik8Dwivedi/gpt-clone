import MemoryService from "../Services/memory.service.js";
import AppError from "../Utils/AppError.js";
import AppSuccess from "../Utils/AppSuccess.js";
import logger from "../Config/logger.js";

const memoryService = new MemoryService();

const handleRequest = async (res, serviceCall, successStatusCode = 200) => {
  try {
    const result = await serviceCall();
    const successResponse = new AppSuccess(
      result.data,
      result.message,
      successStatusCode
    );
    return res.status(successResponse.statusCode).json(successResponse);
  } catch (error) {
    const errorResponse = new AppError(
      error.message || "Something went wrong",
      error.statusCode || 500
    );
    logger.error(`Memory API Error: ${errorResponse.error}`);
    return res.status(errorResponse.statusCode).json(errorResponse);
  }
};

export const addMemory = async (req, res) => {
  const userId = req.auth.userId;
  const { conversationId, key, value } = req.body;
  await handleRequest(
    res,
    () => memoryService.addMemory(userId, conversationId, key, value),
    201
  );
};

export const getConversationMemory = async (req, res) => {
  await handleRequest(res, () =>
    memoryService.getConversationMemory(req.params.conversationId)
  );
};

export const getUserMemory = async (req, res) => {
  const userId = req.auth.userId;
  await handleRequest(res, () => memoryService.getUserMemory(userId));
};

export const updateMemory = async (req, res) => {
  await handleRequest(res, () =>
    memoryService.updateMemory(req.params.memoryId, req.body.value)
  );
};

export const deleteMemory = async (req, res) => {
  await handleRequest(res, () =>
    memoryService.deleteMemory(req.params.memoryId)
  );
};
