
import {
  findByEmail,
  findById,
  createUser as createUserRepository,
} from "./user.repository.js";

import { AppError } from "../../errors/app-error.js";
import { hashPassword } from "../../utils/password.js";

// Retrieve a user using their email
export const getUserByEmail = async (email: string) => {
  return findByEmail(email);
};

// Retrieve a user using their ID
export const getUserById = async (id: string) => {
  return findById(id);
};

// Create a new user
export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  // Step 1: Check whether the email already exists
  const existingUser = await findByEmail(data.email);

  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  // Step 2: Hash the plain-text password
  const passwordHash = await hashPassword(data.password);

  // Step 3: Save the user using the generated password hash
  const newUser = await createUserRepository({
    name: data.name,
    email: data.email,
    passwordHash,
  });

  // Step 4: Return the created user's public information
  return newUser;
};
