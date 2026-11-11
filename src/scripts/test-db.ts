
import { prisma } from "../config/prisma.js";

async function main(): Promise<void> {
  try {
    // Retrieve users from PostgreSQL
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Display retrieved users
    console.log("Users retrieved successfully:");
    console.log(users);
  } catch (error) {
    // Handle database query errors
    console.error("Failed to retrieve users:", error);

    // Mark the script as failed
    process.exitCode = 1;
  } finally {
    // Disconnect Prisma after the query finishes
    await prisma.$disconnect();

    console.log("Prisma disconnected successfully.");
  }
}

main();
