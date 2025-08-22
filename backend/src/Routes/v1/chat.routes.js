import { Router } from "express";
import {
  newConversation,
  getConversations,
  getConversation,
  addMessage,
  editMessage,
  deleteMessage,
} from "../../Controllers/chat.controller.js";
import clerkAuth from "../../Middlewares/clerkAuth.js";

const router = Router();

router.use(clerkAuth);

router.post("/new", newConversation);
router.get("/history", getConversations);
router.get("/:conversationId", getConversation);
router.post("/:conversationId/message", addMessage);
router.patch("/:conversationId/message/:messageId", editMessage);
router.delete("/:conversationId/message/:messageId", deleteMessage);

export default router;
