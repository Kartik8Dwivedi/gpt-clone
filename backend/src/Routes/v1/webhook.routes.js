import { Router } from "express";
import {
  handleClerkWebhook,
  handleFileWebhook,
} from "../../Controllers/webhook.controller.js";

const router = Router();

router.post("/clerk", handleClerkWebhook);
router.post("/file", handleFileWebhook);

export default router;
