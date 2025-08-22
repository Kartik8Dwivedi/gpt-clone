import AuthService from "../Services/auth.service.js";
import AppError from "../Utils/AppError.js";
import AppSuccess from "../Utils/AppSuccess.js";
import logger from "../Config/logger.js";

const authService = new AuthService();

const handleRequest = async (res, serviceCall, successStatusCode = 200) => {
  try {
    const result = await serviceCall();
    const successResponse = new AppSuccess(
      result.data,
      result.message,
      successStatusCode
    );

    logger.info(
      `Request handled successfully. Status: ${successResponse.statusCode}, Message: ${successResponse.message}`
    );

    return res.status(successResponse.statusCode).json(successResponse);
  } catch (error) {
    const errorResponse = new AppError(
      error.message || "Something went wrong",
      error.statusCode || 500
    );

    logger.error(
      `Error handling request. Status: ${errorResponse.statusCode}, Error: ${errorResponse.error}`
    );

    return res.status(errorResponse.statusCode).json(errorResponse);
  }
};

export const syncUser = async (req, res) => {
  logger.info("Received request to sync user.");
  await handleRequest(res, () => authService.syncUser(req.body), 201);
};

export const getProfile = async (req, res) => {
  logger.info("Received request to fetch user profile.");
  const clerkId = req.auth?.userId;
  if (!clerkId) {
    logger.warn("Unauthorized request to /me endpoint.");
    return res.status(401).json(new AppError("Unauthorized", 401));
  }

  await handleRequest(res, () => authService.getUserProfile(clerkId));
};
