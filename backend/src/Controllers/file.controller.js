import FileService from "../Services/file.service.js";
import AppError from "../Utils/AppError.js";
import AppSuccess from "../Utils/AppSuccess.js";
import logger from "../Config/logger.js";

const fileService = new FileService();

const handleRequest = async (res, serviceCall, successStatusCode = 200) => {
  try {
    const result = await serviceCall();
    const successResponse = new AppSuccess(
      result.data,
      result.message,
      successStatusCode
    );
    logger.info(`File API success: ${result.message}`);
    return res.status(successResponse.statusCode).json(successResponse);
  } catch (error) {
    const errorResponse = new AppError(
      error.message || "Something went wrong",
      error.statusCode || 500
    );
    logger.error(`File API error: ${errorResponse.error}`);
    return res.status(errorResponse.statusCode).json(errorResponse);
  }
};

export const uploadFile = async (req, res) => {
  const userId = req.auth.userId;
  logger.info(`User ${userId} uploading file...`);
  const { path, type, size } = req.body; // assuming Uploadcare gives file path/url
  await handleRequest(
    res,
    () => fileService.uploadFile(userId, path, type, size),
    201
  );
};

export const getUserFiles = async (req, res) => {
  const userId = req.auth.userId;
  logger.info(`Fetching files for user ${userId}`);
  await handleRequest(res, () => fileService.getUserFiles(userId));
};

export const getFile = async (req, res) => {
  logger.info(`Fetching file: ${req.params.fileId}`);
  await handleRequest(res, () => fileService.getFile(req.params.fileId));
};

export const deleteFile = async (req, res) => {
  logger.info(`Deleting file: ${req.params.fileId}`);
  await handleRequest(res, () => fileService.deleteFile(req.params.fileId));
};
