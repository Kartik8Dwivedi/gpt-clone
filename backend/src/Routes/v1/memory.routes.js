// routes/memory.routes.js
import { Router } from "express";
import {
  addMemory,
  getConversationMemory,
  getUserMemory,
  updateMemory,
  deleteMemory,
} from "../../Controllers/memory.controller.js";
import clerkAuth from "../../Middlewares/clerkAuth.js";

const router = Router();
router.use(clerkAuth);

router.post("/", addMemory); // Add new memory
router.get("/user", getUserMemory); // Get all user-level memory
router.get("/:conversationId", getConversationMemory); // Get memory for conversation
router.patch("/:memoryId", updateMemory); // Update memory
router.delete("/:memoryId", deleteMemory); // Delete memory

export default router;
