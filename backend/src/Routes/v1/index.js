import express from 'express';
import authRoutes from './auth.routes.js';
import chatRoutes from './chat.routes.js';
import memoryRoutes from './memory.routes.js';
import fileRoutes from './file.routes.js';
import webhookRoutes from './webhook.routes.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.send(`<h1>Hello from the microservice!</h1>`);
});

router.use("/auth", authRoutes);
router.use("/chat", chatRoutes);
router.use("/file", fileRoutes);
router.use("/memory", memoryRoutes);
router.use("/webhook", webhookRoutes);

export default router;