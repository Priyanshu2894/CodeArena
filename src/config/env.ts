
import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce
    .number()
    .int()
    .min(1)
    .max(65535)
    .default(5000),

  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .url("DATABASE_URL must be a valid URL")
    .refine(
      (value) => /^postgres(?:ql)?:\/\//i.test(value),
      {
        message:
          "DATABASE_URL must use the postgresql:// or postgres:// protocol",
      }
    ),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid environment configuration:");

  for (const issue of result.error.issues) {
    console.error(`- ${issue.path.join(".")}: ${issue.message}`);
  }

  process.exit(1);
}

export const env = result.data;

export type Env = z.infer<typeof envSchema>;
