
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { env } from "./env.js";

// Create the PostgreSQL driver adapter
const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

// Create a reusable Prisma Client instance
export const prisma = new PrismaClient({
  adapter,
});
