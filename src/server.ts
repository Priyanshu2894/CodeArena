
import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";

// Prevent shutdown from running more than once
let isShuttingDown = false;

// Graceful shutdown function
const shutdown = async (signal: string): Promise<void> => {
  // Ignore additional shutdown signals
  if (isShuttingDown) {
    console.log("Shutdown already in progress...");
    return;
  }

  isShuttingDown = true;

  console.log(`Received ${signal}. Starting graceful shutdown...`);

  try {
    // Close the HTTP server first
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    console.log("HTTP server closed successfully");

    // Disconnect Prisma after HTTP requests have finished
    await prisma.$disconnect();

    console.log("Prisma disconnected successfully");

    process.exit(0);
  } catch (error) {
    console.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
};

// Keep the HTTP server variable accessible to shutdown()
let server: ReturnType<typeof app.listen>;

const startServer = async (): Promise<void> => {
  try {
    // Connect to PostgreSQL before starting Express
    await prisma.$connect();

    console.log("Database connected successfully");

    // Start the HTTP server
    server = app.listen(env.PORT, () => {
      console.log(`Server is running on port ${env.PORT}`);
    });

    // Listen for operating system termination signals
    process.on("SIGINT", () => {
      void shutdown("SIGINT");
    });

    process.on("SIGTERM", () => {
      void shutdown("SIGTERM");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

void startServer();
