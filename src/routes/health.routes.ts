
import { Router } from "express";
import { prisma } from "../config/prisma.js";

const router = Router();

// Liveness check
router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running",
  });
});

// Readiness check
router.get("/ready", async (_req, res) => {
  try {
    // Execute a simple query to check database connectivity
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      success: true,
      message: "Application is ready",
      dependencies: {
        database: "connected",
      },
    });
  } catch (error) {
    // Log the actual error on the server, not in the API response
    console.error("Readiness check failed: Database unavailable");

    return res.status(503).json({
      success: false,
      message: "Application is not ready",
      dependencies: {
        database: "unavailable",
      },
    });
  }
});

export default router;
