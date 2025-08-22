import { Router } from "express";
import { syncUser, getProfile } from "../../Controllers/auth.controller.js";

const router = Router();

router.post("/sync", syncUser);
router.get("/me", getProfile);

export default router;
