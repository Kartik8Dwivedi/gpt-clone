import { Router } from "express";
import {
  uploadFile,
  getUserFiles,
  getFile,
  deleteFile,
} from "../../Controllers/file.controller.js";
import clerkAuth from "../../Middlewares/clerkAuth.js";

const router = Router();

router.use(clerkAuth);

router.post("/upload", uploadFile);
router.get("/", getUserFiles);
router.get("/:fileId", getFile);
router.delete("/:fileId", deleteFile);

export default router;
