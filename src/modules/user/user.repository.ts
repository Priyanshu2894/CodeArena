
import { prisma } from "../../config/prisma.js";

// Public fields that can safely be returned
const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatarUrl: true,
  createdAt: true,
};

// Find a user using their email
export const findByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
    select: userSelect,
  });
};

export const findByEmailWithPassword = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
    select: {
      ...userSelect,
      passwordHash: true,
    },
  });
};


// Find a user using their ID
export const findById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });
};

// Create a new user
export const createUser = async (data: {
  name: string;
  email: string;
  passwordHash: string;
}) => {
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
    },
    select: userSelect,
  });
};
