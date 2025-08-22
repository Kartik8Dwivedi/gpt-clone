import UserService from "../Services/auth.service.js";
import FileService from "../Services/file.service.js";
import logger from "../Config/logger.js";

const userService = new UserService();
const fileService = new FileService();

export const handleClerkWebhook = async (req, res) => {
  try {
    const event = req.body.type;
    const data = req.body.data;

    logger.info(`Received Clerk webhook: ${event}`);

    switch (event) {
      case "user.created":
        await userService.syncUser(data);
        break;
      case "user.updated":
        await userService.updateUserByClerkId(data.id, data);
        break;
      case "user.deleted":
        await userService.deleteUserByClerkId(data.id);
        break;
      default:
        logger.warn(`Unhandled Clerk webhook event: ${event}`);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    logger.error("Error handling Clerk webhook", err);
    return res.status(500).json({ error: "Webhook error" });
  }
};

export const handleFileWebhook = async (req, res) => {
  try {
    const event = req.body.event;
    const fileData = req.body.data;

    logger.info(`Received File webhook: ${event}`);

    switch (event) {
      case "file.uploaded":
        await fileService.markUploaded(fileData.uuid || fileData.public_id, fileData);
        break;
      case "file.deleted":
        await fileService.markDeleted(fileData.uuid || fileData.public_id);
        break;
      default:
        logger.warn(`Unhandled file webhook event: ${event}`);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    logger.error("Error handling file webhook", err);
    return res.status(500).json({ error: "Webhook error" });
  }
};
