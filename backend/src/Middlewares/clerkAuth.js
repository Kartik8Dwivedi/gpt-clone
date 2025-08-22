import { verifyJwt } from "@clerk/clerk-sdk-node";

const clerkAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = await verifyJwt(token, {
      issuer: process.env.CLERK_JWT_ISSUER,
      jwksUri: process.env.CLERK_JWKS_URI,
    });

    req.auth = { userId: payload.sub, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

export default clerkAuth;


/**
 * auth middleware:
 * import { requireAuth } from "@clerk/express";

app.use("/api/auth/me", requireAuth(), authRoutes);
 */