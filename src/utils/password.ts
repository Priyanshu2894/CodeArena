
import argon2 from "argon2";

// Hash a plain-text password using Argon2id
export const hashPassword = async (
  password: string
): Promise<string> => {
  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
  });

  return passwordHash;
};

// Verify a password against its stored hash
export const verifyPassword = async (
  password: string,
  passwordHash: string
): Promise<boolean> => {
  const isValid = await argon2.verify(passwordHash, password);

  return isValid;
};
