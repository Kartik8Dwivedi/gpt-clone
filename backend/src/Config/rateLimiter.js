import rateLimit from "express-rate-limit";
const rateLimiter = (app) => {
  const limiter = rateLimit({
    windowMs: 10 * 10 * 1000, // 10 minutes
    max: 500, // limit each IP to 500 requests per windowMs
    message: "Too many requests, try again later",
  });
  app.use(limiter);
};

export default rateLimiter;