
import { z } from "zod";

// Schema for user login
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),

  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password cannot exceed 128 characters"),
});

// Infer TypeScript type from the schema
export type LoginInput = z.infer<typeof loginSchema>;
