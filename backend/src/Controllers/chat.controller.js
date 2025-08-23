import ChatService from "../Services/chat.service.js";
import AppError from "../Utils/AppError.js";
import AppSuccess from "../Utils/AppSuccess.js";
import logger from "../Config/logger.js";

const chatService = new ChatService();

const handleRequest = async (res, serviceCall, successStatusCode = 200) => {
  try {
    const result = await serviceCall();
    const successResponse = new AppSuccess(
      result.data,
      result.message,
      successStatusCode
    );
    logger.info(`Chat request successful: ${result.message}`);
    return res.status(successResponse.statusCode).json(successResponse);
  } catch (error) {
    const errorResponse = new AppError(
      error.message || "Something went wrong",
      error.statusCode || 500
    );
    logger.error(`Chat request failed: ${errorResponse.error}`);
    return res.status(errorResponse.statusCode).json(errorResponse);
  }
};

export const newConversation = async (req, res) => {
  const userId = req.auth.userId;
  logger.info(`Creating new conversation for user: ${userId}`);
  await handleRequest(res, () =>
    chatService.createConversation(userId, req.body.title)
  );
};

export const getConversations = async (req, res) => {
  const userId = req.auth.userId;
  logger.info(`Fetching conversations for user: ${userId}`);
  await handleRequest(res, () => chatService.getUserConversations(userId));
};

export const getConversation = async (req, res) => {
  const { conversationId } = req.params;
  logger.info(`Fetching conversation: ${conversationId}`);
  await handleRequest(res, () => chatService.getConversation(conversationId));
};

export const addMessage = async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.auth.userId; // can be used if needed
  logger.info(`Adding message to conversation: ${conversationId}`);
  await handleRequest(
    res,
    () =>
      chatService.addMessage(
        conversationId,
        "user", // sender
        req.body.content,
        req.body.files
      ),
    201
  );
};

export const editMessage = async (req, res) => {
  const { messageId } = req.params;
  logger.info(`Editing message: ${messageId}`);
  await handleRequest(res, () =>
    chatService.editMessage(messageId, req.body.content)
  );
};

export const deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  logger.info(`Deleting message: ${messageId}`);
  await handleRequest(res, () => chatService.deleteMessage(messageId));
};

export const deleteConversation = async (req, res) => {
    const { conversationId } = req.params;
    logger.info(`Deleting conversation: ${conversationId}`);
    await handleRequest(res, () => chatService.deleteConversation(conversationId));
};
