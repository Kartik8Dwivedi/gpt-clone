import express from 'express';
import authRoutes from './auth.routes.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.send(`<h1>Hello from the microservice!</h1>`);
});

router.use("/auth", authRoutes);

export default router;